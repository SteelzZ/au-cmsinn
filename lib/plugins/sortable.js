Sortable = function(){
    this.contentType = 'sortable';
    this.storage = null;
}

Sortable.prototype.constructor = Sortable;

Sortable.prototype.disable = function(){
    $("[data-au-record]").cmsInnSortable('destroy');
    $("[data-au-sortable]").cmsInnSortable('destroy');
}

Sortable.prototype.enable = function(){
    $("[data-au-record]").cmsInnSortable({
        storage: this.storage
    });
    $("[data-au-sortable]").cmsInnSortable({
        storage: this.storage
    });
}

Sortable.prototype.config = function(options){}

CmsInnSortable = new Sortable();

/**
 * jQuery plugin
 */
function SortablePlugin(element, options){
    this.$element = $(element);
    this.settings = $.extend({

    }, options);
    this.storage = null;

    if('storage' in this.settings){
        this.storage = this.settings.storage;
    }

    if(options === 'destroy'){
        this.destroy();
    } else {
        this.init();
    }
} 

SortablePlugin.prototype.destroy = function(){
    this.$element.removeClass('mark');
    if(this.$element.data('sortable')){
        this.$element.sortable("destroy");
    }
}

SortablePlugin.prototype.init = function(){
    var self = this;

    if(this.$element.height() > 0) {
        this.$element.addClass('mark');
    } 

    this.$element.sortable({
        items: "[data-au-sort-order]",
        update: function(event, ui) {
            var order = {};
            var index = 0;
            self.$element.children().each(function(){
                order[$(this).attr('data-au-sort-order')] = index++;
            });

            $.each(order, function(item, o){
                self.storage.update({_id:item}, {$set:{sortOrder:o}});
            });
        }
    });
}

if(Meteor.isClient){
    (function($) {
        $.fn.cmsInnSortable = function(options) {
            return this.each(function() {
                $.data(this, 'cmsInnSortable', new SortablePlugin(this, options));
            });
        };
    }(jQuery));
}