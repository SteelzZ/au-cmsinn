var contentDep = new Deps.Dependency;
i18n = function(){
    this.storage = null;
    this.contentType = 'i18n';
    this.language = 'en_US';
    this.defaultEmptyString = 'Empty';
}

i18n.prototype.constructor = i18n;

i18n.prototype.disable = function(){
    $("[data-au-label]").editable('destroy');  
    $("[data-au-label]").click(function(e) {
        $(this).editable('destroy');  
    });
}

i18n.prototype.enable = function(){
    var self = this;
    $("[data-au-label]").editable({
        placement: 'bottom',
        toggle: 'mouseenter',
        success: function(response, newValue) {
            var parsedLabel = Utilities.parseAttr($(this).attr('data-au-label'));
            // If there is no record id, so it is self-contained record
            if(parsedLabel['recordId'] === null){
                self.upsertRecord(parsedLabel['id'], newValue);
            } else {
                self.upsertRecordField(parsedLabel['recordId'], parsedLabel['fieldId'], newValue)
            }
        }
    });  
    $("[data-au-label]").click(function(e) {
        $(this).editable('toggle');
    });
}

i18n.prototype.config = function(options){}
i18n.prototype.init = function(){}

i18n.prototype.upsertRecord = function(id, value, language){
    var self = this;
    if(language === undefined){
        language = this.language;
    }
    var updateObject = {};
    var insertObject = {};
    updateObject[language] = value;
    insertObject[language] = value;
    this.storage.update({_id:id}, {$set: updateObject}, {}, function(err, docNum){
        if(docNum === 0){
            insertObject['_id'] = id;
            insertObject['contentType'] = self.contentType;
            self.storage.insert(insertObject);
        }
    });
    contentDep.changed();
}

i18n.prototype.upsertRecordField = function(id, field, value, language){
    var self = this;
    if(language === undefined){
        language = this.language;
    }
    var updateObject = {};
    updateObject[field+'.'+language] = value;
    self.storage.update({_id:id}, {$set: updateObject});
    contentDep.changed();
}

i18n.prototype.getLanguage = function(){
    return this.language;
}

i18n.prototype.setLanguage = function(lng){
    this.language = lng;
    contentDep.changed();
}

i18n.prototype.setLocale = function(id){
    var locale = CmsInnLocale.get(id);
    if(locale){
        this.language = locale;
        contentDep.changed();
    }
}

i18n.prototype.getRecord = function(label){
    contentDep.depend();

    var currentLabel = this.storage.collection.findOne({_id:label});

    if(currentLabel){
        var result = currentLabel.get(this.language);
        if(_.isNull(result)){
            return currentLabel.firstFieldWithValue() + '('+this.language+')';
        } 
        return result;
    } else {
        return this.defaultEmptyString;
    }
}

i18n.prototype.getRecordField = function(recordId, field){
    contentDep.depend();
    var record = this.storage.collection.findOne({_id:recordId});

    if(record){
        var result = record.get(field);
        if(_.isNull(result)){
            return record.firstFieldWithValue(field) + '('+this.language+')';
        }
        return result[this.language];
    } else {
        return this.defaultEmptyString;
    }
}

CmsInni18n = new i18n();


if(Meteor.isClient){
    if(UI) {
        UI.registerHelper('c', function (label, prefix) {
            contentDep.depend();

            if(prefix !== undefined && typeof prefix === 'string'){
                label = prefix + label; 
            }

            var parsedLabel = Utilities.parseAttr(label);

            if(parsedLabel['recordId'] === null){
                return CmsInni18n.getRecord(parsedLabel['id']);
            } else {
                return CmsInni18n.getRecordField(parsedLabel['recordId'], parsedLabel['fieldId']);
            }
        });
    } 
}