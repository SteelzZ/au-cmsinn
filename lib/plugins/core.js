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