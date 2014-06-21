if(Meteor.isClient){
    Tinytest.add('CmsInnImage - Test if plugin is being init correctly', function (test) {
        var storage = {
            update : sinon.spy()
        }

        var $element = $('<image src="" data-au-image="id_goes_here"/>');
        $element.cmsInnImage({
            storage : storage
        });

        var pluginWrapper = $element.data('cmsInnImage');
        test.isNotNull(pluginWrapper);
        test.isTrue(pluginWrapper.$element.hasClass('image-mark'));
    });
    Tinytest.add('CmsInnImage - Test if correct css classes is added on events', function (test) {
        var storage = {
            update : sinon.spy()
        }

        var $element = $('<image src="" data-au-image="id_goes_here"/>');
        $element.cmsInnImage({
            storage : storage
        });

        var pluginWrapper = $element.data('cmsInnImage');
        test.isNotNull(pluginWrapper);
        test.isTrue(pluginWrapper.$element.hasClass('image-mark'));

        pluginWrapper.$element.trigger('dragenter');
        test.isTrue(pluginWrapper.$element.hasClass('image-drag-enter'));

        pluginWrapper.$element.trigger('dragleave');
        test.isTrue(pluginWrapper.$element.hasClass('image-mark'));
        test.isFalse(pluginWrapper.$element.hasClass('image-drag-enter'));

        pluginWrapper.$element.trigger('drop');
        test.isFalse(pluginWrapper.$element.hasClass('image-mark'));
        test.isTrue(pluginWrapper.$element.hasClass('image-drag-drop'));

    });

    Tinytest.add('CmsInnImage - Test if self-contained id is passed <save> methods calls insert method on storage adapter', function (test) {
        CmsInnImage.storage.collection.findOne = sinon.stub();
        CmsInnImage.storage.collection.findOne.withArgs({_id:'imageId'}).returns(null);
        CmsInnImage.storage.insert = sinon.spy();
        CmsInnImage.save('imageId', {name:'name'}, 'imagedata');

        test.equal(CmsInnImage.storage.insert.callCount, 1);
    });

    Tinytest.add('CmsInnImage - Test if self-contained id is passed <save> methods calls update method on storage adapter because image exists', function (test) {
        CmsInnImage.storage.collection.findOne = sinon.stub();
        CmsInnImage.storage.collection.findOne.withArgs({_id:'imageId'}).returns(true);
        CmsInnImage.storage.update = sinon.spy();
        CmsInnImage.save('imageId', {name:'name'}, 'imagedata');

        test.equal(CmsInnImage.storage.update.callCount, 1);
    });

    Tinytest.add('CmsInnImage - Test if record id is passed <save> methods calls update method on storage adapter', function (test) {
        CmsInnImage.storage.update = sinon.spy();
        CmsInnImage.save('imageId[fieldid]', {name:'name'}, 'imagedata');

        test.equal(CmsInnImage.storage.update.callCount, 1);
    });

    Tinytest.add('CmsInnImage - Test if image with correct size is returned if size does exists, called on self-contained id', function (test) {
        CmsInn.configure();
        CmsInnImage.storage.collection.findOne = sinon.stub();
        CmsInnImage.storage.collection.findOne.returns({
            get : function(){
                return {
                    '100x100' : 'img'
                }
            }
        });
        var result = CmsInnImage.getSized('imageId', '100x100');

        test.equal(result.imageData, 'img');
    });

    Tinytest.add('CmsInnImage - Test if image with correct size is returned if size does exists, called on record id', function (test) {
        CmsInn.configure();

        var callback = function(name){
            if(name == 'field'){
                return callback;
            } 
            if(name == 'sizes'){
                return {
                    '100x100' : 'img'
                };
            }     
        };

        CmsInnImage.storage.collection.findOne = sinon.stub();
        CmsInnImage.storage.collection.findOne.returns({
            get : callback
        });
        var result = CmsInnImage.getSized('imageId[field]', '100x100');

        test.equal(result.imageData, 'img');
    });

    Tinytest.add('CmsInnImage - Test if server method to resize image is called if img with requested size does not exists, record id', function (test) {
        CmsInn.configure();
        Meteor.apply = sinon.spy();
        var callback = function(name){
            if(name == 'field'){
                return callback;
            } 
            if(name == 'sizes'){
                return {
                    '10x10' : 'img'
                };
            }     
        };

        CmsInnImage.storage.collection.findOne = sinon.stub();
        CmsInnImage.storage.collection.findOne.returns({
            get : callback
        });
        var result = CmsInnImage.getSized('imageId[field]', '100x100');

        test.equal(Meteor.apply.callCount, 1);
    });

    Tinytest.add('CmsInnImage - Test if server method to resize image is called if img with requested size does not exists, self-contained id', function (test) {
        CmsInn.configure();
        Meteor.apply = sinon.spy();
        CmsInnImage.storage.collection.findOne = sinon.stub();
        CmsInnImage.storage.collection.findOne.returns({
            get : function(){
                return {
                    '10x10' : 'img'
                }
            }
        });
        var result = CmsInnImage.getSized('imageId', '100x100');

        test.equal(Meteor.apply.callCount, 1);
    });
}