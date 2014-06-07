var contentDep = new Deps.Dependency;
Navigation = function(){
    this.contentType = 'navigation';
    this.pageTypes = [];
    this.defaultTemplate = '__home';
}

Navigation.prototype.constructor = Navigation;

Navigation.prototype.disable = function(){
    $("[data-au-nav]").cmsInnNav.destroy();  
}

Navigation.prototype.enable = function(){
    $("[data-au-nav]").cmsInnNav({
        itemAdded: function(name, title){
            CmsInni18n.update(name, title);
        }
    });
}

Navigation.prototype.buildRoute = function(navId){
    contentDep.changed();
    var item = ContentCollection.findOne({
        _id: navId+'_'+CmsInnNavigation.contentType
    });

    if(item){
        if(!(item._id in Router.routes)){
            Router.route(item._id, {
                path : item.uri,
                template: item.template,
                data : function(){
                    //var data = ContentCollection.find({path:this.path});
                    return {
                        route: this.route,
                        params: this.params,
                        path : this.path
                        //pageData : data
                    };
                }
            });
        } 
        return item;
    }
}

Navigation.prototype.init = function(){
    var items = ContentCollection.find({contentType:this.contentType});
    // Add default route, because in service.js where we toggle between loading and normal templates
    // tpl is not loaded if there is no routes and on initial load there is no routes
    // @todo: find a reason why it is like that \
    var self = this;
    if(items.count() == 0){
        Router.route('__default', {
            path : '/',
            template: self.defaultTemplate,
            data : function(){
                //var data = ContentCollection.find({path:this.path});
                return {
                    route: this.route,
                    params: this.params,
                    path : this.path
                    //pageData : data
                };
            }
        });
    }
    
    items.forEach(function(nav){
        Router.route(nav._id, {
            path : nav.uri,
            template: nav.template,
            data : function(){
                //var data = ContentCollection.find({path:this.path});
                return {
                    route: this.route,
                    params: this.params,
                    path : this.path
                    //pageData : data
                };
            }
        });
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

CmsInnNavigation = new Navigation();

function generatePageTypeOptions(types, selected){
    var options = '';
    _.each(types, function(item){
        var selectedString = selected === item.type ? 'selected' : '';
        options += ' \
            <option value="'+item.type+'" '+selectedString+'>'+item.type+'</option> \
        ';
    });
    return options;
}

function generateTpl(currentItem, navId){
    var selectedTemplate = null;
    var uri = '';
    if(currentItem){
        selectedTemplate = currentItem.template;
        uri = currentItem.uri;
    }
    var addNewItemTpl = ' \
        <div class="clearfix nav-actions"> \
            <div class="col-md-12 column"> \
                <div class="row clearfix"> \
                    <div class="col-md-12 column"> \
                        <div class="form-group"> \
                            <select class="form-control cmsinn-nav-page-type-'+navId+'"> \
                                '+generatePageTypeOptions(CmsInnNavigation.pageTypes, selectedTemplate)+' \
                            </select> \
                        </div> \
                    </div> \
                </div> \
                <div class="row clearfix"> \
                    <div class="col-md-12 column"> \
                        <div class="form-group"> \
                            <div class="input-group"> \
                                <span class="input-group-addon">url</span> \
                                <input type="text" class="form-control cmsinn-nav-item-uri-'+navId+'" value="'+uri+'"> \
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

    return addNewItemTpl;
}

if(Meteor.isClient){
    (function($) {
        $.fn.cmsInnNav = function(options) {
            var self = this;
            var settings = $.extend({
                addNewItem : function(navId, uri, template){
                    var item = ContentCollection.findOne({_id:navId});
                    if(item == undefined){
                        ContentCollection.insert({
                            _id: navId,
                            uri: uri,
                            template: template,
                            contentType: CmsInnNavigation.contentType
                        });
                        contentDep.changed();
                        settings.itemAdded(navId, uri, template);
                    }
                },
                updateItem : function(navId, uri, template){
                    ContentCollection.update({_id:navId}, {
                        $set : {
                            uri: uri,
                            template: template
                        }
                    });
                    contentDep.changed();
                    settings.itemUpdated(navId, uri, template);
                },
                itemAdded : function(navId, uri, template){},
                itemUpdated : function(navId, uri, template){},
            }, options);

            $.fn.cmsInnNav.destroy = function() {
                //self.unbind('mouseover');
                self.each(function() {
                    $(this).removeClass('mark');
                    $(this).popover('destroy');
                    $(this).unbind('mouseover');
                });
            }

            return this.each(function() {
                var element = this;
                $(element).addClass('mark');
                $(element).on('mouseover', function(){
                    $("[data-au-nav]").each(function(){
                        $(this).popover('destroy');
                    });
                    var navId = $(this).attr('data-au-nav') + '_' + CmsInnNavigation.contentType;
                    var currentItem = ContentCollection.findOne({_id:navId});
                    $(element).popover({
                        title: 'Navigation',
                        html: true,
                        content : generateTpl(currentItem, navId),
                        container: 'body',
                        placement: 'bottom',
                        animation: false
                    });
                    $(element).on('shown.bs.popover', function () {
                        $('.close-nav').on('click', function(){
                            $(element).popover('destroy');
                        });  
                        $('.save-nav').on('click', function(){
                            var template = $('.cmsinn-nav-page-type-'+navId+' option:selected').val();
                            var uri = $('.cmsinn-nav-item-uri-'+navId).val();
                            if(currentItem){
                                settings.updateItem(
                                    navId, 
                                    uri,
                                    template
                                );
                            } else {
                                settings.addNewItem(
                                    navId, 
                                    uri,
                                    template
                                );
                            }
                            
                            $(element).popover('destroy');
                        });
                    });
                    $(element).popover('show');
                });
            });
        };
    }(jQuery));

    if(UI){
        UI.registerHelper('nav', function (navId, action) {
            switch(action){
                case "href":
                    var route = CmsInnNavigation.buildRoute(navId);
                    if(route){
                        return route.uri;
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