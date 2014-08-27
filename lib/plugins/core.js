/**
 * Base object for plugins
 */
PluginBase = function (storage){
    this.storage = storage;
}

// Storage adapter will be shared accross all child plugin instances
PluginBase.prototype.setStorage = function(storage){
    this.storage = storage;
}

/**
 * Init jQuery plugin 
 */
PluginBase.prototype.initjQueryPlugin = function($, uiPluginClass){
    if(Meteor.isClient){
        var self = this;
        $.fn[self.name] = function(options) {
            return this.each(function() {
                $.data(this, self.name, new uiPluginClass(this, options));
            });
        };
    }
}

PluginBase.prototype.init = function(){}
PluginBase.prototype.enable = function(){}
PluginBase.prototype.disable = function(){}
PluginBase.prototype.config = function(){}

CmsInnPluginBase = new PluginBase({});



// // Creating new plugin
// LabelPlugin = function(selector, ui, storage){
//     // Call base constructor
//     PluginBase.prototype.constructor.call(this, storage);
//     this.selector = selector;
//     this.ui = ui;
// }

// LabelPlugin.prototype = new PluginBase()
// LabelPlugin.prototype.constructor = PluginBase;

// // Initialize
// var storage = {
//     adapter : {}
// }

// function JLabelPlugin(element, options){
//     this.$element = $(element);
//     this.settings = $.extend({

//     }, options);
//     this.storage = null;
// } 

// AuLabel = new LabelPlugin("[data-au-label]");
// AuLabel.setStorage(storage);

// AuLabel.registerJqueryPlugin('cmsInnLabel', function(element, options){
//     return new JLabelPlugin(element, options);
// });
// if(Meteor.isClient){
//     $('.group').cmsInnLabel('destroy');
// }

// AuLabelOther = new LabelPlugin("[data-au-label]");
// AuLabelOther.setStorage(storage);