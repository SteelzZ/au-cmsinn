/**
 * Helper functions
 **/
function template(pathToImage){
    var addNewItemTpl = ' \
        <img id="trash" src="'+pathToImage+'" width="256" height="256"/> \
    ';
    return addNewItemTpl;
}

/**
 * Plugin Wrapper
 **/
Deletable = function(){
    this.storage = null;
    this.trash = template('/packages/au-cmsinn/assets/trash-icon.png');
}

Deletable.prototype.constructor = Deletable;

Deletable.prototype.disable = function(){
    $("[data-au-deletable]").cmsInnDeletable('destroy');
}

Deletable.prototype.enable = function(){
    $("[data-au-deletable]").cmsInnDeletable({
        storage: this.storage,
        trash : $(this.trash)
    });
}

Deletable.prototype.config = function(options){
    if('trash' in options){
        if(typeof options.trash === 'function'){
            this.trash = options.trash();
        } else if(typeof options.trash === 'string'){
            this.trash = options.trash;
        }
    }
}

CmsInnDeletable = new Deletable();

/**
 * jQuery plugin
 */
function DeletablePlugin(element, options){
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

DeletablePlugin.prototype.destroy = function(){
    if(this.$element.data('draggable')){
        this.$element.removeClass('au-mark');
        this.$element.draggable("destroy");
    }
}

DeletablePlugin.prototype.initTrash = function(){
    var self = this;
    $('body').append(this.settings.trash);
    this.settings.trash.hide();

    this.settings.trash.droppable({
        drop: function(event, ui) {
            var elementToDelete = $(ui.draggable).attr('data-au-deletable');
            var parsedAttribute = Utilities.parseAttr(elementToDelete);

            var itemId = parsedAttribute['id'];

            if(parsedAttribute['recordId']){
                itemId = parsedAttribute['recordId'];
            }

            var item = self.storage.collection.findOne({_id: itemId});
            if(item){
                var parents = self.storage.collection.find({parents:{$in:item['parents']}});

                $.each(item['parents'], function(key, id){
                    var pull = {
                        $pull : {children:itemId}
                    };
                    if(parsedAttribute['fieldId']){
                        pull['$pull'][parsedAttribute['fieldId']] = itemId;
                    }
                    self.storage.update({_id:id}, pull);
                })

                self.storage.remove({
                    _id: itemId
                });
            }
        }
    });
}   

DeletablePlugin.prototype.init = function(){
    var self = this;

    this.initTrash();
    
    this.$element.addClass('au-mark');
    this.$element.draggable({
        start: function() {
            var windowH = $(window).height();
            var windowW = $(window).width();

            var trashCanWidth = self.settings.trash.width();
            var trashCanHeight = self.settings.trash.height();

            var top = $(window).scrollTop() + (windowH / 2) - (trashCanHeight / 2);
            var left = $(window).scrollLeft() + (windowW / 2) - (trashCanWidth / 2);

            self.settings.trash.css({
                position:"absolute",
                left: left,
                top: top,
            });
            self.settings.trash.fadeIn(500);  
        },
        stop: function(){
            self.settings.trash.fadeOut(500);
        },
        cursor: 'move',
        helper: 'clone',
        revert: "invalid",
    });
}

if(Meteor.isClient){
    (function($) {
        $.fn.cmsInnDeletable = function(options) {
            var self = this; 
            return this.each(function() {
                $.data(this, 'cmsInnDeletable', new DeletablePlugin(this, options));
            });
        };
    }(jQuery));
}