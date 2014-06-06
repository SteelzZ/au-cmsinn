AuCmsInn = function(plugins){
    var self = this;
    this.subsciptionName = 'au-cmsinn-content';
    this.plugins = plugins;
    this.currentPlugin = null;

    if(Meteor.isServer){
        this.publish();
    }

    if(Meteor.isClient){

        this.subscribe();
    }
}

AuCmsInn.prototype.constructor = AuCmsInn;

AuCmsInn.prototype.configure = function(options){
    options = options || {};
    this.options = this.options || {};
    _.extend(this.options, options);

    Router.configure(this.options);

    if(this.options.loadingTemplate){
        Router.configure({
            layoutTemplate: this.options.loadingTemplate
        });
    }
}

AuCmsInn.prototype.onStarted = function(){
    if(this.options.layoutTemplate){
        Router.configure({
            layoutTemplate: this.options.layoutTemplate
        });
    }
}

AuCmsInn.prototype.subscribe = function(){
    var self = this;
    Router.configure({
        autoStart: false
    });

    // we start Router manually because we have to load routes first
    Meteor.subscribe(this.subsciptionName, function(){
        _.each(self.plugins, function(options, item){
            if(self.plugins[item].init != undefined){
                self.plugins[item].init();
            }
        });
        self.onStarted();
        Router.start();
    });
}

AuCmsInn.prototype.publish = function(){
    Meteor.publish(this.subsciptionName, function(){
        return ContentCollection.find({});
    });
}

AuCmsInn.prototype.configPlugins = function(plugins){
    var self = this;
    _.each(plugins, function(options, item){
        if(item in self.plugins){
            self.plugins[item].config(options);
        }
    });
}

AuCmsInn.prototype.toggle = function(plugin){
    if(this.currentPlugin){
        this.currentPlugin.disable();
    }
    this.currentPlugin = this.plugins[plugin];
    this.currentPlugin.enable();
}

AuCmsInn.prototype.disable = function(){
    if(this.currentPlugin){
        this.currentPlugin.disable();
    }
}

AuCmsInn.prototype.init = function(){
    var self = this;
}

CmsInn = new AuCmsInn({
    i18n : CmsInni18n,
    navigation: CmsInnNavigation,
    image: CmsInnImage,
    record: CmsInnRecord,
    locale: CmsInnLocale,
    sortable: CmsInnSortable,
    deletable: CmsInnDeletable
});