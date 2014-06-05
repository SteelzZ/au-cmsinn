AuCmsInn = function(plugins){
    var self = this;
    this.subsciptionName = 'au-cmsinn-content';
    this.plugins = plugins;
    this.currentPlugin = null;

    if(Meteor.isServer){
        this.publish();
    }

    if(Meteor.isClient){
        Router.configure({
            autoStart: false
        });
        this.subscribe();
    }
}

AuCmsInn.prototype.constructor = AuCmsInn;

AuCmsInn.prototype.subscribe = function(){
    var self = this;
    // we start Router manually because we have to load routes first
    Meteor.subscribe(this.subsciptionName, function(){
        _.each(self.plugins, function(options, item){
            if(self.plugins[item].init != undefined){
                self.plugins[item].init();
            }
        });
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