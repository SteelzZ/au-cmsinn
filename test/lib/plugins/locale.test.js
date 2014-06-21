if(Meteor.isClient){
    Tinytest.add('CmsInnLocale - Test if plugin is being init correctly', function (test) {
        var settings = {}

        var $element = $('<a data-au-locale="id_goes_here"></a>');
        $element.cmsInnLocale(settings);

        var pluginWrapper = $element.data('cmsInnLocale');
        test.isNotNull(pluginWrapper);

        test.isTrue(pluginWrapper.$element.hasClass('mark'));
    });

    Tinytest.add('CmsInnLocale - Test if UI <render> method is called on mouseover', function (test) {
        var settings = {
            ui : {
                storage : null,
                element : null,
                currentLocale : null,
                init: sinon.spy(),
                closeWindow : sinon.spy(),
                bindLanguage: sinon.spy(),
                destroy : sinon.spy(),
                buildOptions: sinon.spy(),
                render : sinon.spy(),
            }
        }

        var $element = $('<a data-au-locale="id_goes_here"></a>');
        $element.cmsInnLocale(settings);

        var pluginWrapper = $element.data('cmsInnLocale');
        pluginWrapper.$element.trigger('mouseover');
        test.equal(pluginWrapper.ui.render.callCount, 1);
    });

    Tinytest.add('CmsInnLocale - Test if update method is called on storage adapter', function (test) {
        CmsInn.configure({});
        CmsInnLocale.storage.update = sinon.spy();
        CmsInnLocale.storage.collection.findOne = sinon.stub();
        CmsInnLocale.storage.collection.findOne.withArgs({_id:'imageId'}).returns(true);
        CmsInnLocale.bindLanguage('en_US', 'imageId');

        test.equal(CmsInnLocale.storage.update.callCount, 1);
    });
}