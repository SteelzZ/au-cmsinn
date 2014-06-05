Image = function(){
    this.contentType = 'image';
}

Image.prototype.constructor = Image;

Image.prototype.disable = function(){
    $("[data-au-image]").cmsInnImage.destroy();
}

Image.prototype.enable = function(){
    $("[data-au-image]").cmsInnImage({
        onAdded: function(){}
    });
}

Image.prototype.config = function(options){}

Image.prototype.get = function(imageId, size, prefix){
    var joinedId = null;
    if(prefix == null){
        prefix = '';
    }

    if(typeof prefix == 'object'){
        prefix = undefined;
    } else {
        joinedId = prefix + imageId;
    }

    if(size == undefined){
        return ContentCollection.findOne({
            _id: imageId
        });
    }

    field = imageId.replace(/\[/g, '').replace(/\]/g, '');

    var select = {
        fields : {}
    };

    select['fields'][field] = 1;
    var item = ContentCollection.findOne({_id:prefix}, select);
    var img = null;
    if(item && field in item){
         img = item[field];
    } else {
        var query = {fields:{
            name: 1,
            contentType : 1
        }};
        query['fields']['sizes.'+size] = 1;
        
        img = ContentCollection.findOne({
            _id: joinedId
        }, query);
    }

    if(img && typeof img.sizes == 'object' && size in img.sizes){
        img.imageData = img.sizes[size];
        return img;
    } else {
        var options = {
            imageId: imageId,
            size: size,
            prefix: prefix
        };


        

        Meteor.apply('/cmsinn/image/resize', [options]);
    }
}

CmsInnImage = new Image();


if(Meteor.isClient){
    
    (function($) {
        $.fn.cmsInnImage = function(options) {
            var self = this;
            var settings = $.extend({
                save: function(imageId, file, imageData){
                    var fields = imageId.match(/\[(([a-z0-9_]*))\]/ig);
                    var field = '';
                    var recordId = '';
                    if(fields != null && fields.length === 1){
                        recordId = imageId.substr(0, imageId.indexOf('['));
                        field = fields[0].replace(/\[/g, '').replace(/\]/g, '');
                    }

                    if(recordId != '' && field != ''){
                        var updateObject = {};
                        updateObject[field+'.imageData'] = imageData;
                        updateObject[field+'.name'] = file.name;
                        updateObject[field+'.sizes'] = {};
                        ContentCollection.update({_id: recordId}, {$set : updateObject});
                        settings.imageUpdated(imageId, name, imageData);
                    } else {
                        var currentImage = CmsInnImage.get(imageId);
                        if(currentImage){
                            var updateObject = {};
                            updateObject['imageData'] = imageData;
                            updateObject['name'] = file.name;
                            updateObject['sizes'] = {};
                            ContentCollection.update({_id: imageId}, {$set : updateObject});
                            settings.imageUpdated(imageId, name, imageData);
                        } else {
                            ContentCollection.insert({
                                _id: imageId,
                                name: file.name,
                                imageData: imageData,
                                contentType: CmsInnImage.contentType,
                                sizes : {}
                            });
                            settings.imageAdded(imageId, name, imageData);
                        }
                    }
                },
                imageAdded : function(imageId, name, imageData){},
                imageUpdated : function(imageId, name, imageData){}
            }, options);

            $.fn.cmsInnImage.destroy = function() {
                //self.unbind('mouseover');
                self.each(function() {
                    $(this).removeClass('image-mark');
                    $(this).removeClass('image-drag-enter');
                    $(this).removeClass('image-drag-leave');
                    $(this).removeClass('image-drag-drop');
                    $(this).unbind('dragover');
                    $(this).unbind('dragleave');
                    $(this).unbind('dragenter');
                    $(this).unbind('drop');
                });
            }

            return this.each(function() {
                var image = this;
                var imageId = $(image).attr('data-au-image');

                $(image).addClass('image-mark');
                $(image).on('dragover', function (evt){
                    evt.stopPropagation();
                    evt.preventDefault();
                });
                $(image).on('dragleave', function (evt){
                    evt.stopPropagation();
                    evt.preventDefault();
                    $(this).removeClass('image-drag-enter');
                    $(this).removeClass('image-drag-leave');
                    $(this).removeClass('image-drag-drop');
                    $(this).addClass('image-mark');
                });
                $(image).on('dragenter', function (evt){
                    evt.stopPropagation();
                    evt.preventDefault();
                    $(this).removeClass('image-mark');
                    $(this).removeClass('image-drag-leave');
                    $(this).removeClass('image-drag-drop');
                    $(this).addClass('image-drag-enter');
                });
                $(image).on('drop', function (evt) {
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
                            $(image).attr('src', e.target.result);
                            settings.save(imageId, files[0], e.target.result);
                        }
                        reader.readAsDataURL(files[0]);
                    }
                });
            });
        };
    }(jQuery));
    

    if(UI) {
        UI.registerHelper('loadImg', function (imageId, size, prefix) {
            var image = CmsInnImage.get(imageId, size, prefix);
            if(image != undefined){
                return image.imageData;
            } else {
                return 'http://placehold.it/100x100';
            }
        });
    } 
}