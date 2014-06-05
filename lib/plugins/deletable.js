Deletable = function(){
    this.contentType = 'deletable';
}

Deletable.prototype.constructor = Deletable;

Deletable.prototype.disable = function(){
    //$("[data-au-record]").cmsInnDeletable('destroy');
    $("[data-au-deletable]").cmsInnDeletable('destroy');
    // $("[data-au-record]").draggable('destroy');
    // $("[data-au-deletable]").draggable('destroy');
}

Deletable.prototype.enable = function(){
    //$("[data-au-record]").cmsInnDeletable({});
    $("[data-au-deletable]").cmsInnDeletable({});
}

Deletable.prototype.config = function(options){}


CmsInnDeletable = new Deletable();

function generateTpl(){
    var addNewItemTpl = ' \
        <img id="trash" src="/packages/au-cmsinn/assets/trash-icon.png" width="256" height="256"/> \
    ';
    
    return addNewItemTpl;
}


if(Meteor.isClient){
    (function($) {
        $.fn.cmsInnDeletable = function(options) {
            var self = this;

            if(options === 'destroy'){
                return this.each(function() {
                    var record = this;
                    if($(record).data('draggable')){
                        $(record).removeClass('mark');
                        $(record).draggable("destroy");
                    }
                });
            }

            var settings = $.extend({
                
            }, options);

            var $trash = $(generateTpl());
            $('body').append($trash);
            
            var windowH = $(window).height();
            var windowW = $(window).width();

            var trashCanWidth = $trash.width();
            var trashCanHeight = $trash.height();

            $trash.hide();
            
            $trash.droppable({
                drop: function(event, ui) {
                    var elementToDelete = $(ui.draggable).attr('data-au-deletable');
                    CmsInnRecord.removeItem(elementToDelete);
                }
            });

            return this.each(function() {
                var record = this;
                $(record).addClass('mark');
                $(record).draggable({
                    start: function() {
                        var top = $(window).scrollTop() + (windowH / 2) - (trashCanHeight / 2);
                        var left = $(window).scrollLeft() + (windowW / 2) - (trashCanWidth / 2);

                        $trash.css({
                            position:"absolute",
                            left: left,
                            top: top
                        });

                        $trash.fadeIn(500);  
                    },
                    stop: function(){
                         $trash.fadeOut(500);
                    },
                    cursor: 'move',
                    helper: 'clone',
                    revert: "invalid",
                });
            });


        };
    }(jQuery));
}