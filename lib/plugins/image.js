if(Meteor.isServer){
    var gm = Npm.require('gm');
    var Fiber = Npm.require("fibers");
    Meteor.methods({
        '/au-cmsinn/image/resize' : function(options){
            check(options, Match.ObjectIncluding({
                size: String
            }));

            var image = null;
            if(options.recordId === null){
                var image = CmsInnImage.storage.collection.findOne({
                    _id: options.id
                });
            } else {
                var select = {
                    fields : {}
                };

                select['fields'][options.fieldId] = 1;
                var item = CmsInnImage.storage.collection.findOne({_id:options.recordId}, select);

                if(item && options.fieldId in item){
                    image = item[options.fieldId];
                }
            }

            if(image){
                var regex = /^data:.+\/(.+);base64,(.*)$/;

                var matches = image.imageData.match(regex);
                var ext = matches[1];
                var data = matches[2];
                var buf = new Buffer(data, 'base64');

                var updateImage = Meteor.bindEnvironment(function(ext, buffer, options){
                    var sizeData = 'data:image/'+ext+';base64,'+buffer.toString('base64');
                    var update = {$set:{}};

                    if(options.recordId !== null){
                        update['$set'][options.fieldId+'.sizes.'+options.size] = sizeData;
                        CmsInnImage.storage.update({_id:options.recordId}, update);
                    } else {
                        update['$set']['sizes.'+options.size] = sizeData;
                        CmsInnImage.storage.update({_id:options.id}, update);
                    }
                }, function(e){
                    throw e;
                }); 

                var dimensions = options.size.split("x");

                gm(buf).resize(dimensions[0], dimensions[1], "!").toBuffer(function (err, buffer) {
                    updateImage(ext, buffer, options);
                });
            }      
        },
    });
} 

/**
 * Plugin Wrapper
 **/
Image = function(){
    this.storage = null;
    this.contentType = 'image';
}

Image.prototype.constructor = Image;

Image.prototype.disable = function(){
    $("[data-au-image]").cmsInnImage({
        destroy: true,
        storage: this.storage,
        ui: this.ui
    });
}

Image.prototype.enable = function(){
    $("[data-au-image]").cmsInnImage({
        storage: this.storage,
        ui: this.ui,
        onAdded: function(){}
    });
}

Image.prototype.config = function(options){}

Image.prototype.getSized = function(imageId, size){
    var parsedAttribute = Utilities.parseAttr(imageId);
    var img = null;

    if(parsedAttribute['recordId'] === null){
        var query = {fields:{
            name: 1,
            contentType : 1
        }};
        query['fields']['sizes.'+size] = 1;

        img = this.storage.collection.findOne({
            _id: parsedAttribute['id']
        }, query);
    } else {
        var select = {
            fields : {}
        };

        select['fields'][parsedAttribute['fieldId']] = 1;
        var item = this.storage.collection.findOne({_id:parsedAttribute['recordId']}, select);
        if(item && parsedAttribute['fieldId'] in item){
             img = item[parsedAttribute['fieldId']];
        }
    }

    if(img && typeof img.sizes == 'object' && size in img.sizes){
        img.imageData = img.sizes[size];
        return img;
    } else {
        var options = {
            id: parsedAttribute['id'],
            recordId: parsedAttribute['recordId'],
            fieldId: parsedAttribute['fieldId'],
            size: size
        };

        Meteor.apply('/au-cmsinn/image/resize', [options], function(err, response){
            console.log(err);
            console.log(response);
        });
    } 
}

Image.prototype.save = function(imageId, file, imageData){
    var parsedAttribute = Utilities.parseAttr(imageId);

    if(parsedAttribute['recordId'] !== null){
        var updateObject = {};
        updateObject[parsedAttribute['fieldId']+'.imageData'] = imageData;
        updateObject[parsedAttribute['fieldId']+'.name'] = file.name;
        updateObject[parsedAttribute['fieldId']+'.sizes'] = {};
        this.storage.update({_id: parsedAttribute['recordId']}, {$set : updateObject});
    } else {
        var currentImage = this.storage.collection.findOne({_id:parsedAttribute['id']});
        if(currentImage){
            var updateObject = {};
            updateObject['imageData'] = imageData;
            updateObject['name'] = file.name;
            updateObject['sizes'] = {};
            this.storage.update({_id: parsedAttribute['id']}, {$set : updateObject});
        } else {
            this.storage.insert({
                _id: parsedAttribute['id'],
                name: file.name,
                imageData: imageData,
                contentType: this.contentType,
                sizes : {}
            });
        }
    }
}

CmsInnImage = new Image();

/**
 * jQuery plugin
 */
function ImagePlugin(element, options){
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

ImagePlugin.prototype.destroy = function(){
    this.ui.destroy();
    this.$element.removeClass('image-mark');
    this.$element.removeClass('image-drag-enter');
    this.$element.removeClass('image-drag-leave');
    this.$element.removeClass('image-drag-drop');
    this.$element.off('dragover');
    this.$element.off('dragleave');
    this.$element.off('dragenter');
    this.$element.off('drop');
}

ImagePlugin.prototype.init = function(){
    var self = this;
    var imageId = this.$element.attr('data-au-image');
    this.$element.addClass('image-mark');

    this.$element.on('dragover', function (evt){
        evt.stopPropagation();
        evt.preventDefault();
    });

    this.$element.on('dragleave', function (evt){
        evt.stopPropagation();
        evt.preventDefault();
        $(this).removeClass('image-drag-enter');
        $(this).removeClass('image-drag-leave');
        $(this).removeClass('image-drag-drop');
        $(this).addClass('image-mark');
    });

    this.$element.on('dragenter', function (evt){
        evt.stopPropagation();
        evt.preventDefault();
        $(this).removeClass('image-mark');
        $(this).removeClass('image-drag-leave');
        $(this).removeClass('image-drag-drop');
        $(this).addClass('image-drag-enter');
    });

    this.$element.on('drop', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $(this).removeClass('image-mark');
        $(this).removeClass('image-drag-enter');
        $(this).removeClass('image-drag-leave');
        $(this).addClass('image-drag-drop');
        
        var files = evt.originalEvent.dataTransfer.files;
        
        if (files && files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                self.$element.attr('src', e.target.result);
                CmsInnImage.save(imageId, files[0], e.target.result);
            }
            reader.readAsDataURL(files[0]);
        }
    });
}

if(Meteor.isClient){
    (function($) {
        $.fn.cmsInnImage = function(options) {
            return this.each(function() {
                $.data(this, 'cmsInnImage', new ImagePlugin(this, options));
            });
        };
    }(jQuery));

    if(UI){
        UI.registerHelper('loadImg', function (imageId, size, prefix) {
            if(prefix !== undefined && typeof prefix === 'string'){
                imageId = prefix + imageId; 
            }

            var image = CmsInnImage.getSized(imageId, size);
            if(image != undefined){
                return image.imageData;
            } else {
                return 'http://placehold.it/100x100';
            }
        });
    }
}