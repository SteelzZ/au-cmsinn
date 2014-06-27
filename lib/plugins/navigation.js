/**
 * Default UI
 */
var NavigationUI = {
    storage : null,
    currentRecord: {template: '', uri: '', id: null, recordId: null, fieldId: null},
    element : null,
    init: function(id, fieldId, recordId, storage, element){
        this.destroy();
        this.storage = storage;
        this.element = element;
        var rec = null;
        if(recordId === null){
            rec = CmsInnNavigation.getRecord(id);
        } else {
            rec = CmsInnNavigation.getRecordField(recordId, fieldId);
        }

        if(_.isObject(rec)){
            _.extend(this.currentRecord, rec);
        }
        
        if(!_.has(this.currentRecord, 'get')){
            this.currentRecord['get'] = function(){
                return '';
            }
        }

        this.currentRecord['id'] = id;
        this.currentRecord['recordId'] = recordId;
        this.currentRecord['fieldId'] = fieldId;

        $('body').on('click', '.close-nav', this.closeWindow);
        if(recordId === null){
            $('body').on('click', '.save-nav', this.updateRecord);
        } else {
            $('body').on('click', '.save-nav', this.updateRecordField);
        }
    },
    closeWindow : function(){
        NavigationUI.element.popover('destroy');
    },
    updateRecord: function(){
        var template = $('.cmsinn-nav-page-type option:selected').val();
        var uri = $('.cmsinn-nav-item-uri').val();

        CmsInnNavigation.updateRecord(
            NavigationUI.currentRecord.id, 
            template, 
            uri
        );
        NavigationUI.element.popover('destroy');
    },
    updateRecordField: function(){
        var template = $('.cmsinn-nav-page-type option:selected').val();
        var uri = $('.cmsinn-nav-item-uri').val();

        CmsInnNavigation.updateRecordField(
            NavigationUI.currentRecord.recordId, 
            NavigationUI.currentRecord.fieldId, 
            template, 
            uri
        );

        NavigationUI.element.popover('destroy');
    },
    destroy : function(){
        // Take both down :)
        this.currentRecord = {template: '', uri: '', id: null, recordId: null, fieldId: null};
        $('body').off('click', '.save-nav', this.updateRecord);
        $('body').off('click', '.save-nav', this.updateRecordField);
        $('body').off('click', '.close-nav', this.closeWindow);
    },
    buildOptions: function(types, selected){
        var options = '';
        _.each(types, function(item){
            var selectedString = selected === item.type ? 'selected' : '';
            options += ' \
                <option value="'+item.type+'" '+selectedString+'>'+item.type+'</option> \
            ';
        });
        return options;
    },
    render : function(id, fieldId, recordId, storage, element){
        //selectedTemplate, uri, pageTypes
        this.init(id, fieldId, recordId, storage, element);
        var tpl = ' \
            <div class="clearfix nav-actions"> \
                <div class="col-md-12 column"> \
                    <div class="row clearfix"> \
                        <div class="col-md-12 column"> \
                            <div class="form-group"> \
                                <select class="form-control cmsinn-nav-page-type"> \
                                    <option value="">None</option> \
                                    '+this.buildOptions(CmsInnNavigation.pageTypes, this.currentRecord.get('template'))+' \
                                </select> \
                            </div> \
                        </div> \
                    </div> \
                    <div class="row clearfix"> \
                        <div class="col-md-12 column"> \
                            <div class="form-group"> \
                                <div class="input-group"> \
                                    <span class="input-group-addon">url</span> \
                                    <input type="text" class="form-control cmsinn-nav-item-uri" value="'+this.currentRecord.get('uri')+'"> \
                                </div> \
                            </div> \
                        </div> \
                    </div> \
                    <div class="row clearfix"> \
                        <div class="col-md-12 column"> \
                            <div class="form-group"> \
                                <button type="button" class="btn btn-default save-nav">Save</button> \
                                <button type="button" class="btn btn-default close-nav">Hide</button> \
                            </div> \
                        </div> \
                    </div> \
                </div> \
            </div> \
        ';

        return tpl;
    }
};


/**
 * Plugin Wrapper
 **/
var contentDep = new Deps.Dependency;
Navigation = function(){
    this.storage = null;
    this.contentType = 'navigation';
    this.ui = NavigationUI;
    this.pageTypes = [];
    this.defaultTemplate = '__home';
}

Navigation.prototype.constructor = Navigation;

Navigation.prototype.disable = function(){
    $("[data-au-nav]").cmsInnNav({
        destroy: true,
        storage: this.storage,
        ui: this.ui
    });
}

Navigation.prototype.enable = function(){
    $("[data-au-nav]").cmsInnNav({
        storage: this.storage,
        ui: this.ui
    });
}

Navigation.prototype.getRecord = function(recordId){
    var item = this.storage.collection.findOne({
        _id: recordId,
        contentType: this.contentType
    });

    if(_.isObject(item)){
        return item;
    }
}

Navigation.prototype.getRecordField = function(recordId, field){
    var record = this.storage.collection.findOne({_id:recordId});

    if(_.isObject(record)){
        // @todo: rly ? hell no, has to be revisited
        var fieldResult = record.get(field);
        if(_.isObject(fieldResult)){
            var _g = _.pick(record, 'get');
            _.extend(fieldResult, _g);

            return fieldResult;
        }
        
    }
}

Navigation.prototype.updateRecordField =function(recordId, field, template, uri){
    var updateObject = {};
    updateObject[field+'.uri'] = uri;
    updateObject[field+'.template'] = template;
    this.storage.update({_id: recordId}, {$set : updateObject});
}

Navigation.prototype.updateRecord = function(id, template, uri){
    var self = this;
    this.storage.update({_id:id}, {
        $set : {
            uri: uri,
            template: template
        }
    }, {}, function(err, docNum){
        if(docNum === 0){
            self.storage.insert({
                _id: id,
                uri: uri,
                template: template,
                contentType: self.contentType
            });
        }
        contentDep.changed();
    });
}

Navigation.prototype.config = function(options){
    if('pageTypes' in options){
        var self = this;
        _.each(options.pageTypes, function(type){
            if(_.where(self.pageTypes, type).length == 0){
                self.pageTypes.push(type);
            } else {
                throw new Meteor.Error("Page type with such name ["+type.type+"] already exists!");
            }
        });
    }

    if('defaultTemplate' in options){
        this.defaultTemplate = options.defaultTemplate;
    }
}

Navigation.prototype.buildRoute = function(id, record){
    contentDep.changed();
    Router.route(id, {
        path : record.get('uri'),
        template: record.get('template'),
        data : function(){
            return {
                route: this.route,
                params: this.params,
                path : this.path
            };
        }
    });
}

Navigation.prototype.init = function(){
    // Routes created for record will be loaded over helper buildRoute()
    var items = this.storage.collection.find({contentType:this.contentType});
    // Add default route, because in service.js where we toggle between loading and normal templates
    // tpl is not loaded if there is no routes and on initial load there is no routes
    // @todo: find a reason why it is like that \
    var self = this;
    if(items.count() == 0){
        Router.route('__default', {
            path : '/',
            template: self.defaultTemplate,
            data : function(){
                return {
                    route: this.route,
                    params: this.params,
                    path : this.path
                };
            }
        });
    }
    
    items.forEach(function(nav){
        Router.route(nav._id, {
            path : nav.get('uri'),
            template: nav.get('template'),
            data : function(){
                return {
                    route: this.route,
                    params: this.params,
                    path : this.path
                };
            }
        });
    });
}

CmsInnNavigation = new Navigation();

/**
 * jQuery plugin
 */
function NavigationPlugin(element, options){
    this.$element = $(element);
    this.settings = $.extend({

    }, options);

    if('storage' in this.settings){
        this.storage = this.settings.storage;
    }

    if(('ui' in this.settings) && typeof this.settings.ui === 'object'){
        this.ui = this.settings.ui;
    } 

    if('destroy' in options && options['destroy']){
        this.destroy();
    } else {
        this.init();
    }
} 

NavigationPlugin.prototype.destroy = function(){
    this.ui.destroy();
    this.$element.removeClass('mark');
    this.$element.popover('destroy');
    this.$element.off('mouseover');
}

NavigationPlugin.prototype.init = function(){
    var self = this;
    this.$element.addClass('mark');

    this.$element.on('mouseover', function(){
        // Destroy other popovers
        $("[data-au-nav]").each(function(){
            if(this != self.$element){
                $(this).popover('destroy');
            }
        });

        var parsedAttribute = Utilities.parseAttr($(this).attr('data-au-nav'));

        $(this).popover({
            title: 'Navigation',
            html: true,
            content : self.ui.render(
                parsedAttribute['id'], parsedAttribute['fieldId'], parsedAttribute['recordId'], self.storage, self.$element
            ),
            container: 'body',
            placement: 'bottom',
            animation: false
        });

        $(this).popover('show');
    });
}

if(Meteor.isClient){
    (function($) {
        $.fn.cmsInnNav = function(options) {
            return this.each(function() {
                $.data(this, 'cmsInnNav', new NavigationPlugin(this, options));
            });
        };
    }(jQuery));

    if(UI){
        UI.registerHelper('nav', function (navId, action, prefix) {
            switch(action){
                case "href":
                    if(prefix !== undefined && typeof prefix === 'string'){
                        navId = prefix + navId; 
                    }

                    var parsedLabel = Utilities.parseAttr(navId);
                    var record = null;
                    if(parsedLabel['recordId'] === null){
                        record = CmsInnNavigation.getRecord(parsedLabel['id']);
                    } else {
                        record = CmsInnNavigation.getRecordField(parsedLabel['recordId'], parsedLabel['fieldId']);
                    }
                    if(record){
                        CmsInnNavigation.buildRoute(parsedLabel['id'], record);
                        return record.uri;
                    }
                break;
                case "isActive":
                    var current = Router.current();
                    if(current){
                        return current.route.name == navId ? "active" : "";
                    } else {
                        return "";
                    }
                break;
            }
        });
    }
}