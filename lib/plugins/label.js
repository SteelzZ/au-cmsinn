// ----------------------------------- Label Plugin UI bit --------------------------------------//
/**
 * Plugin UI 
 * This has to be easy to extend or replace
 * Allow injecting UI object from outside through settings
 */
function LabelPluginUI(){

}

// Render UI HTML and return it
LabelPluginUI.prototype.render = function(){

}

// Destroy UI
LabelPluginUI.prototype.destroy = function(){

}

// Init UI
LabelPluginUI.prototype.init = function(){
    
}
// ----------------------------------- Label Plugin UI bit --------------------------------------//




// ----------------------------------- Label Plugin bit --------------------------------------//
var gLabelName   = 'cmsInnLabel';
var gContentType = 'label';
var gSelector    = 'data-au-label';
var contentDep   = new Deps.Dependency;

/**
 * Label plugin constructor
 */
LabelPlugin = function(name, contentType, selector, ui, storage){
    // Call base constructor to set storage
    PluginBase.prototype.constructor.call(this, storage);
    this.selector = selector;
    this.ui = ui;
    this.name = name;
    this.contentType = contentType;
}

LabelPlugin.prototype = CmsInnPluginBase;
LabelPlugin.prototype.constructor = PluginBase;

LabelPlugin.prototype.disable = function($){
    $('['+gSelector+']').editable('destroy');  
    $('['+gSelector+']').click(function(e) {
        $(this).editable('destroy');  
    });
}

LabelPlugin.prototype.enable = function($){
    var self = this;

    $('['+gSelector+']').editable({
        placement: 'bottom',
        toggle: 'mouseenter',
        success: function(response, newValue) {
            var parsedLabel = Utilities.parseAttr($(this).attr(gSelector));

            // If there is no record id, so it is self-contained record
            if(parsedLabel[Utilities.CONST_RECORD_ID] === null){
                self.upsertRecord(parsedLabel[Utilities.CONST_ID], newValue);
            } else {
                self.upsertRecordField(parsedLabel[Utilities.CONST_RECORD_ID], parsedLabel[Utilities.CONST_FIELD_ID], newValue)
            }
        }
    });  

    $('['+gSelector+']').click(function(e) {
        $(this).editable('toggle');
    });
}

LabelPlugin.prototype.upsertRecord = function(id, value, language){
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

LabelPlugin.prototype.upsertRecordField = function(id, field, value, language){
    var self = this;
    if(language === undefined){
        language = this.language;
    }
    var updateObject = {};
    updateObject[field+'.'+language] = value;
    self.storage.update({_id:id}, {$set: updateObject});
    contentDep.changed();
}

CmsInnLabel = new LabelPlugin(gLabelName, gContentType, '['+gSelector+']', new LabelPluginUI());

// ----------------------------------- Label Plugin bit --------------------------------------//





// ----------------------------------- jQuery bit --------------------------------------//

/**
 * Interface to UI through jQuery
 */
function jQLabelPlugin(element, options){
    this.$element = $(element);
    this.settings = $.extend({}, options);
    this.init();
} 

jQLabelPlugin.prototype.init = function(){}

// Register your plugin with jQuery handler
// Run this only on client
if(Meteor.isClient){
    CmsInnLabel.initjQueryPlugin(jQuery, jQLabelPlugin);

    if(UI) {
        UI.registerHelper('c', function (label, prefix) {
            contentDep.depend();

            if(prefix !== undefined && typeof prefix === 'string'){
                label = prefix + label; 
            }

            var parsedLabel = Utilities.parseAttr(label);

            if(parsedLabel[Utilities.CONST_RECORD_ID] === null){
                return CmsInni18n.getRecord(parsedLabel[Utilities.CONST_ID]);
            } else {
                return CmsInni18n.getRecordField(parsedLabel[Utilities.CONST_RECORD_ID], parsedLabel[Utilities.CONST_FIELD_ID]);
            }
        });
    } 
}
