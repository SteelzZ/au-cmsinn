Storage = function(adapter){
    this.adapter = adapter;
    this.collection = this.adapter.collection;
    this.hooks = {
        'beforeInsert' : [],
        'beforeUpdate' : [],
        'beforePublish' : []
    };
}

Storage.prototype.constructor = Storage;

Storage.prototype.update = function(selector, modifier, options, callback){
    _.each(this.hooks.beforeUpdate, function(hook){
        hook(selector, modifier, options);
    });
    this.adapter.update(selector, modifier, options, callback);
}

Storage.prototype.insert = function(doc, callback){
    _.each(this.hooks.beforeInsert, function(hook){
        hook(doc);
    });
    this.adapter.insert(doc, callback);
}

Storage.prototype.remove = function(selector, options, callback){
    this.adapter.remove(selector, options, callback);
}

Storage.prototype.beforeInsert = function(callback){
    this.hooks.beforeInsert.push(callback);
}

Storage.prototype.beforeUpdate = function(callback){
    this.hooks.beforeUpdate.push(callback);
}

Storage.prototype.beforePublish = function(callback){
    this.hooks.beforePublish.push(callback);
}

AuCmsInn = function(plugins){
    var self = this;
    this.subsciptionName = 'au-cmsinn-content';
    this.plugins = plugins;
    this.currentPlugin = null;
    this.options = {
        storageAdapter : new RemoteCollectionStorageAdapter()
    };

    if(Meteor.isClient){
        this.subscribe();
    }
}

AuCmsInn.prototype.constructor = AuCmsInn;

AuCmsInn.prototype.configure = function(options){
    var self = this;
    options = options || {};

    this.options = this.options || {};
    _.extend(this.options, options);

    this.storage = new Storage(this.options.storageAdapter); 

    _.each(self.plugins, function(options, item){
        if(typeof self.plugins[item].hooks === 'object'){
            if('beforeInsert' in self.plugins[item].hooks){
                self.storage.beforeInsert(self.plugins[item].hooks['beforeInsert']);
            }

            if('beforeUpdate' in self.plugins[item].hooks){
                self.storage.beforeUpdate(self.plugins[item].hooks['beforeUpdate']);
            }

            if('beforePublish' in self.plugins[item].hooks){
                self.storage.beforePublish(self.plugins[item].hooks['beforePublish']);
            }
        }
    });

    _.each(self.plugins, function(options, item){
        self.plugins[item].storage = self.storage;
    });
    
    Router.configure(this.options);

    if(this.options.loadingTemplate){
        Router.configure({
            layoutTemplate: this.options.loadingTemplate
        });
    }

    if(this.options.plugins){
        _.each(this.options.plugins, function(options, item){
            if(item in self.plugins){
                self.plugins[item].config(options);
            }
        });
    }

    // publish after configuration is done, because we are waitting for roles
    // that will define who can see what
    if(Meteor.isServer){
        this.publish();
    }
}

AuCmsInn.prototype.onStarted = function(){
    if(this.options && this.options.layoutTemplate){
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

    var init = function(){
        _.each(self.plugins, function(options, item){
            if(self.plugins[item].init != undefined){
                self.plugins[item].init();
            }
        });
        self.onStarted();
        Router.start();
    };

    // we start Router manually because we have to load routes first
    Meteor.subscribe(this.subsciptionName, init, init);
}

AuCmsInn.prototype.publish = function(){
    var self = this;
    Meteor.publish(this.subsciptionName, function(){
        var that = this;
        var query = {};
        var options = {};
        _.each(self.storage.hooks.beforePublish, function(hook){
            hook(query, options, that.userId);
        });
        return self.storage.collection.find(query, options);
    });
}

AuCmsInn.prototype.toggle = function(plugin, sticky){
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
    deletable: CmsInnDeletable,
    versioning: CmsInnVersioning
});