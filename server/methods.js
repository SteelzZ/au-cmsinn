var gm = Npm.require('gm');
var Fiber = Npm.require("fibers");
Meteor.methods({
    '/cmsinn/image/resize' : function(options){
        check(options, Match.ObjectIncluding({
            imageId: String,
            size: String
        }));
        var imageId = options.imageId ;
        if(options.prefix != undefined){
            imageId = options.prefix + options.imageId;
        }

        var image = ContentCollection.findOne({
            _id: imageId
        });

        var field = null;
        var fields = options.imageId.match(/\[(([a-z0-9_]*))\]/ig);
        if(options.prefix && fields != null && fields.length === 1){
            field = options.imageId.replace(/\[/g, '').replace(/\]/g, '');

            var select = {
                fields : {}
            };

            select['fields'][field] = 1;
            var item = ContentCollection.findOne({_id:options.prefix}, select);

            if(item && field in item){
                image = item[field];
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
                if(options.prefix && field && field.length > 0){
                    update['$set'][field+'.sizes.'+options.size] = sizeData;
                    ContentCollection.update({_id:options.prefix}, update);
                } else {

                    if(options.prefix != undefined){
                        imageId = options.prefix + options.imageId;
                    }
                    update['$set']['sizes.'+options.size] = sizeData;
                    ContentCollection.update({_id:imageId}, update);
                }
            }, function(e){
                throw e;
            }); 

            var dimensions = options.size.split("x");

            gm(buf).resize(dimensions[0],dimensions[1], "!").toBuffer(function (err, buffer) {
                updateImage(ext, buffer, options);
            });
        } 
    },
});