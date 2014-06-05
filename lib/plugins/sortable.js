Sortable = function(){
    this.contentType = 'sortable';
}

Sortable.prototype.constructor = Sortable;

Sortable.prototype.disable = function(){
    $("[data-au-record]").cmsInnSortable('destroy');
    $("[data-au-sortable]").cmsInnSortable('destroy');
}

Sortable.prototype.enable = function(){
    $("[data-au-record]").cmsInnSortable({});
    $("[data-au-sortable]").cmsInnSortable({});
}

Sortable.prototype.config = function(options){}

CmsInnSortable = new Sortable();

if(Meteor.isClient){
    (function($) {
        $.fn.cmsInnSortable = function(options) {
            var self = this;

            if(options === 'destroy'){
                
                return this.each(function() {
                    var record = this;
                    $(record).removeClass('mark');
                    if($(record).data('sortable')){

                        $(record).sortable("destroy");
                    }
                });
            }

            var settings = $.extend({
                
            }, options);

            return this.each(function() {
                var record = this;
                if($(record).height() > 0) {
                    $(record).addClass('mark');
                } 
                
                $(record).sortable({
                    items: "[data-au-sort-order]",
                    update: function(event, ui) {
                        var order = {};
                        var index = 0;
                        $(record).children().each(function(){
                            order[$(this).attr('data-au-sort-order')] = index++;
                        });

                        $.each(order, function(item, o){
                            ContentCollection.update({_id:item}, {$set:{sortOrder:o}});
                        });
                    
                    }
                });
            });
        };
    }(jQuery));

    if(UI) {
        
        
    } 
}