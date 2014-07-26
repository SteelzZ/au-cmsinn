if(Meteor.isClient){
    Tinytest.add('CmsInnRecord - Test if cmsInnRecord plugin is being initialized', function (test) {
        var storage = {
            update : sinon.spy()
        }

        var $recordElement = $('<ul data-au-record="testing"></ul>');
        $recordElement.cmsInnRecord({
            storage : storage
        });

        var recordPluginWrapper = $recordElement.data('cmsInnRecord');
        test.isNotNull(recordPluginWrapper);
        test.isTrue(recordPluginWrapper.$element.hasClass('au-mark'));
        test.isTrue(recordPluginWrapper.$element.hasClass('empty-record'));
    });

    Tinytest.add('CmsInnRecord - Test if UI method <render> is being called only with place id', function (test) {
        var settings = {
            storage : {
                update : sinon.spy()
            },
            ui : {
                callbacks: sinon.spy(),
                storage : sinon.spy(),
                init: sinon.spy(),
                destroy : sinon.spy(),
                addRecordHandler : sinon.spy(),
                addSubRecordHandler : sinon.spy(),
                mapRecordHandler : sinon.spy(),
                buildOptions : sinon.spy(),
                render : sinon.spy()
            }
        }

        var $recordElement = $('<ul data-au-record="/pathandname"></ul>');
        $recordElement.cmsInnRecord(settings);
        var recordPluginWrapper = $recordElement.data('cmsInnRecord');

        test.isNotNull(recordPluginWrapper);
        test.equal(typeof recordPluginWrapper.ui, 'object');

        recordPluginWrapper.$element.trigger('mouseover');
        test.equal(recordPluginWrapper.ui.render.callCount, 1);

        test.equal(recordPluginWrapper.ui.render.getCall(0).args[0], "pathandname");
        test.equal(recordPluginWrapper.ui.render.getCall(0).args[1], null);
        test.equal(recordPluginWrapper.ui.render.getCall(0).args[2], null);
    });

    Tinytest.add('CmsInnRecord - Test if UI method is being called with place id, record id and field id', function (test) {
        var settings = {
            storage : {
                update : sinon.spy()
            },
            ui : {
                callbacks: sinon.spy(),
                storage : sinon.spy(),
                init: sinon.spy(),
                destroy : sinon.spy(),
                addRecordHandler : sinon.spy(),
                addSubRecordHandler : sinon.spy(),
                mapRecordHandler : sinon.spy(),
                buildOptions : sinon.spy(),
                render : sinon.spy()
            }
        }

        var $recordElement = $('<ul data-au-record="record_id[field_name]"></ul>');
        $recordElement.cmsInnRecord(settings);

        var recordPluginWrapper = $recordElement.data('cmsInnRecord');
        recordPluginWrapper.$element.trigger('mouseover');
        test.equal(recordPluginWrapper.ui.render.callCount, 1);

        test.equal(recordPluginWrapper.ui.render.getCall(0).args[0], "record_id[field_name]");
        test.equal(recordPluginWrapper.ui.render.getCall(0).args[1], "field_name");
        test.equal(recordPluginWrapper.ui.render.getCall(0).args[2], "record_id");
    });
}