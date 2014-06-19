if(Meteor.isClient){
    Tinytest.add('CmsInnNav - Test if plugin is being init correctly', function (test) {
        var storage = {
            update : sinon.spy()
        }

        var $element = $('<a data-au-nav="id_goes_here[with_field]"></a>');
        $element.cmsInnNav({
            storage : storage
        });

        var pluginWrapper = $element.data('cmsInnNav');
        test.isNotNull(pluginWrapper);
        test.isTrue(pluginWrapper.$element.hasClass('mark'));
    });
}