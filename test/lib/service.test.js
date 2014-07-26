if(Meteor.isClient){
    Tinytest.add('CmsInn - Test if CmsInn is initialized correctly with given plugins', function (test) {
        var plugins = {
            i18n : {
                init: sinon.spy()
            },
            navigation: {
                init: sinon.spy()
            },
            image: {
                init: sinon.spy()
            },
            record: {
                init: sinon.spy()
            },
            locale: {
                init: sinon.spy()
            },
            sortable: {
                init: sinon.spy()
            }
        };
        TestCmsInn = new AuCmsInn(plugins);

        test.isNotNull(TestCmsInn);
        test.equal(TestCmsInn.subsciptionName, 'au-cmsinn-content');
        test.equal(TestCmsInn.settingsKey, 'au-cmsinn');
        test.equal(TestCmsInn.currentPlugin, null);
        test.equal(TestCmsInn.options, {
            storageAdapter : new RemoteCollectionStorageAdapter(),
            plugins: {}
        });
        test.equal(TestCmsInn.plugins, plugins);
    });
}