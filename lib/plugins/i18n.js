var contentDep = new Deps.Dependency;
i18n = function(){
    this.contentType = 'i18n';
    this.language = 'en_US';
}

i18n.prototype.constructor = i18n;

i18n.prototype.disable = function(){
    $("[data-au-label]").editable('destroy');  
    $("[data-au-label]").click(function(e) {
        $(this).editable('destroy');  
    });
}

i18n.prototype.enable = function(){
    $("[data-au-label]").editable({
        placement: 'bottom',
        toggle: 'mouseenter',
        success: function(response, newValue) {
            var label = $(this).attr('data-au-label');
            CmsInni18n.update(label, newValue)
        }

    });  
    $("[data-au-label]").click(function(e) {
        $(this).editable('toggle');
    });
}

i18n.prototype.config = function(options){}
i18n.prototype.init = function(){

}

i18n.prototype.getLanguage = function(lng){
    return this.language;
}

i18n.prototype.setLanguage = function(lng){
    this.language = lng;
    contentDep.changed();
}

i18n.prototype.setLocale = function(id){
    id = id + '_locale';
    var result = ContentCollection.findOne({_id:id});
    if(result){
        this.language = result['locale'];
        contentDep.changed();
    }
}

i18n.prototype.get = function(label){
    var exclude = ["_id", "contentType", "constructor"];
    contentDep.depend();
    var currentLabel = ContentCollection.findOne({_id:label});
    if(currentLabel){
        if(this.language in currentLabel){
            return currentLabel[this.language];
        } else {
            for(var lang in currentLabel){
                if($.inArray(lang, exclude) == -1){
                    if(currentLabel[lang].length > 0){
                        return currentLabel[lang] + '('+this.language+')';;
                    }
                }
            }
        }
        
    } else {
        return 'Empty';
    }
}

i18n.prototype.update = function(label, value, language){
    if(language == undefined){
        language = this.language;
    }
    var currentLabel = ContentCollection.findOne({_id:label});

    var fields = label.match(/\[(([a-z0-9_]*))\]/ig);
    var field = '';
    var recordId = '';
    if(fields != null && fields.length === 1){
        recordId = label.substr(0, label.indexOf('['));
        field = fields[0].replace(/\[/g, '').replace(/\]/g, '');
    }

    if(currentLabel){
        var updateObject = {};
        updateObject[language] = value;
        ContentCollection.update(
            {_id:label}, 
            {
                $set: updateObject
            }
        );
    } else {
        if(recordId == '' && field == ''){
            var insertObject = {
                _id: label,
                contentType: this.contentType
            };
            insertObject[language] = value;
            try{
                ContentCollection.insert(insertObject);
            } catch(e){

            }
        } else {
            var updateObject = {};
            updateObject[field+'.'+language] = value;
            ContentCollection.update({_id:recordId}, {$set : updateObject});
        }
        
    } 
    contentDep.changed();
}

CmsInni18n = new i18n();


if(Meteor.isClient){
    if(UI) {
        UI.registerHelper('c', function (label, prefix) {
            contentDep.depend();
            if(prefix && prefix.length > 0){
                field = label.replace(/\[/g, '').replace(/\]/g, '');

                var select = {
                    fields : {}
                };

                select['fields'][field] = 1;
                var item = ContentCollection.findOne({_id:prefix}, select);

                if(item && field in item){
                    if(CmsInni18n.language in item[field]){
                        return item[field][CmsInni18n.language];
                    } else {
                        for(var lang in item[field]){
                            if(item[field][lang].length > 0){
                                return item[field][lang] + '('+CmsInni18n.language+')';
                            }
                        }
                    }
                }
            }

            if(prefix != undefined && typeof prefix == 'string'){
                label = prefix + label; 
            }
            return CmsInni18n.get(label);
        });
    } 
}