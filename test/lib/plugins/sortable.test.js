if(Meteor.isClient){
    Tinytest.add('CmsInnSortable - Test if on items order update correct data is passed to storage adapter', function (test) {

        var storage = {
            update : sinon.spy()
        }

        var $sortableElement = $('<ul data-au-sortable="true"><li data-au-sort-order="1"></li><li data-au-sort-order="2"></li><li data-au-sort-order="3"></li></ul>');
        $sortableElement.cmsInnSortable({
            storage : storage
        });

        var sortablePluginWrapper = $sortableElement.data('cmsInnSortable');

        test.isFalse(sortablePluginWrapper.$element.hasClass('mark'));

        var sortablePlugin = sortablePluginWrapper.$element.data('sortable');
        test.isNotNull(sortablePlugin);

        sortablePluginWrapper.$element.sortable('option', 'update')(null, {});
        test.equal(3, storage.update.callCount);
        test.equal(0, storage.update.getCall(0).args[1]['$set']['sortOrder']);
        test.equal(1, storage.update.getCall(1).args[1]['$set']['sortOrder']);
        test.equal(2, storage.update.getCall(2).args[1]['$set']['sortOrder']);

        test.equal({"_id":"1"}, storage.update.getCall(0).args[0]);
        test.equal({"_id":"2"}, storage.update.getCall(1).args[0]);
        test.equal({"_id":"3"}, storage.update.getCall(2).args[0]);
    });
}