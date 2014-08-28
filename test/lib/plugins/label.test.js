if(Meteor.isClient){
    Tinytest.add('CmsInnLabel - Test if label jQuery plugin is being initialized correctly when enable() is called', function (test) {
        var selector = {
            editable: sinon.spy(),
            click: sinon.spy()
        };
        fakeJquery = sinon.stub().returns(selector);
        CmsInnLabel.enable(fakeJquery);
        test.equal(fakeJquery.callCount, 2);
        test.equal(fakeJquery.getCall(0).args[0], '[data-au-label]');
        test.equal(selector.editable.getCall(0).args[0].placement, 'bottom');
        test.equal(selector.editable.getCall(0).args[0].toggle, 'mouseenter');
    });

    Tinytest.add('CmsInnLabel - Test if label jQuery plugin is being destroyed correctly when disable() is called', function (test) {
        var selector = {
            editable: sinon.spy(),
            click: sinon.spy()
        };
        fakeJquery = sinon.stub().returns(selector);

        CmsInnLabel.disable(fakeJquery);

        test.equal(fakeJquery.callCount, 2);
        test.equal(fakeJquery.getCall(0).args[0], '[data-au-label]');
        test.equal(selector.editable.getCall(0).args[0], 'destroy');
    });
}