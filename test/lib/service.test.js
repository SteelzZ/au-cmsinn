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
            },
            fakeOne: {
                init : sinon.spy()
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

    Tinytest.add('CmsInn - Test if CmsInn.configure initializes storage engine', function (test) {
        var plugins = {};
        var options = {
            storageAdapter : sinon.spy()
        };
        TestCmsInn = new AuCmsInn(plugins);
        TestCmsInn.configure(options);

        test.equal(TestCmsInn.storage.adapter, options.storageAdapter);
    });

    Tinytest.add('CmsInn - Test if CmsInn.configure extends on passed options', function (test) {
        var plugins = {};
        var options = {
            someOption : true,
            deep : {
                val : true
            }
        };
        TestCmsInn = new AuCmsInn(plugins);
        TestCmsInn.configure(options);

        test.equal(TestCmsInn.options.someOption, true);
        test.equal(TestCmsInn.options.deep.val, true);
    });

    Tinytest.add('CmsInn - Test if CmsInn.configure attaches plugin pre-update/insert/publish hooks', function (test) {
        var plugins = {
            somePlugin : {
                config: sinon.spy(),
                hooks : {
                    beforeInsert : sinon.spy(),
                    beforeUpdate : sinon.spy(),
                    beforePublish : sinon.spy(),
                }
            }
        };
        var options = {};
        TestCmsInn = new AuCmsInn(plugins);
        TestCmsInn.configure(options);

        test.equal(TestCmsInn.storage.hooks['beforeInsert'], [plugins.somePlugin.hooks.beforeInsert]);
        test.equal(TestCmsInn.storage.hooks['beforeUpdate'], [plugins.somePlugin.hooks.beforeUpdate]);
        test.equal(TestCmsInn.storage.hooks['beforePublish'], [plugins.somePlugin.hooks.beforePublish]);
    });

    Tinytest.add('CmsInn - Test if CmsInn.configure set storage to loaded plugin', function (test) {
        var plugins = {
            somePlugin : {
                config: sinon.spy(),
            }
        };
        var options = {};
        TestCmsInn = new AuCmsInn(plugins);
        TestCmsInn.configure(options);

        test.equal(TestCmsInn.plugins.somePlugin.storage, TestCmsInn.storage);
    });

    Tinytest.add('CmsInn - Test if CmsInn.configure calls IronRouter.configure()', function (test) {
        Router.configure = sinon.spy();
        var plugins = {};
        var options = {};
        TestCmsInn = new AuCmsInn(plugins);
        TestCmsInn.configure(options);

        test.equal(Router.configure.called, true);
        test.equal(Router.configure.callCount, 2);
    });

    Tinytest.add('CmsInn - Test if CmsInn.configure calls IronRouter.configure() when loadinglayout option is passed', function (test) {
        Router.configure = sinon.spy();
        var plugins = {};
        var options = {
            loadingTemplate : 'my-loading-template'
        };
        TestCmsInn = new AuCmsInn(plugins);
        TestCmsInn.configure(options);

        test.equal(Router.configure.callCount, 3);
    });

    Tinytest.add('CmsInn - Test if CmsInn.configure passes options added to settings.json to plugin and config() method is called', function (test) {
        Meteor.settings = {
            'au-cmsinn' : {
                somePlugin : {
                    optionA: true
                }
            }
        };
        var plugins = {
            somePlugin : {
                config: sinon.spy(),
            }
        };
        var options = {};
        TestCmsInn = new AuCmsInn(plugins);
        TestCmsInn.configure(options);

        test.equal(TestCmsInn.options.plugins.somePlugin.optionA, true);
        test.equal(plugins.somePlugin.config.called, true);
    });

    Tinytest.add('CmsInn - Test if CmsInn.toggle calls enable() on requested plugin and calls disable() on currently turned on plugin', function (test) {
        var plugins = {
            testPlugin : {
                enable: sinon.spy(),
                disable: sinon.spy()
            },
            otherPlugin: {
                enable: sinon.spy()  
            }
        };
        var options = {};
        TestCmsInn = new AuCmsInn(plugins);
        // turn on first plugin
        TestCmsInn.toggle('testPlugin');

        // Now turn off currently turned on and switch on new on
        TestCmsInn.toggle('otherPlugin');

        test.equal(plugins.testPlugin.enable.callCount, 1);
        test.equal(plugins.testPlugin.disable.callCount, 1);
        test.equal(plugins.otherPlugin.enable.callCount, 1);
    });
}

if(Meteor.isServer){
     Tinytest.add('CmsInn - Test if CmsInn.configure calls Meteor.publish', function (test) {
        Meteor.publish = sinon.spy();
        var plugins = {};
        var options = {};
        TestCmsInn = new AuCmsInn(plugins);
        TestCmsInn.configure(options);

        test.equal(Meteor.publish.callCount, 1);
    });
}