Package.describe({
  summary: "Practical, simple and yet powerfull CMS solution for meteor projects"
});

Npm.depends({
    'gm': '1.16.0'
});

Package.on_use(function (api, where) {
    api.imply(['iron-router']);
    api.imply(['roles']);

    api.use(['underscore', 'ui', 'iron-router', 'deps', 'templating', 'roles'], ['client', 'server']);
    api.use(['jquery', 'jquery-ui', 'bootstrap-3', 'x-editable-bootstrap'], ['client']);

    api.add_files('lib/storage/remote-collection-storage.js', ['client', 'server']);

    api.add_files('lib/utils.js', ['client', 'server']);

    api.add_files('lib/3rd/font-awesome.min.css', ['client']);
    api.add_files('client/css/font-awesome-override.css', ['client']);

    api.add_files('assets/trash-icon.png', ['client']);

    api.add_files('lib/3rd/wysiwyg-color.css', ['client']);
    api.add_files('lib/3rd/bootstrap-wysihtml5-0.0.2.css', ['client']);

    api.add_files('lib/3rd/wysihtml5-0.3.0.js', ['client']);
    api.add_files('lib/3rd/bootstrap-wysihtml5-0.0.2.js', ['client']);

    api.add_files('lib/3rd/wysihtml5.js', ['client']);

    api.add_files('client/views/controls.html', ['client']);
    api.add_files('client/views/controls.js', ['client']);

    api.add_files('client/css/main.css', ['client']);

    api.add_files('lib/plugins/image.js', ['client', 'server']);
    api.add_files('lib/plugins/locale.js', ['client', 'server']);
    api.add_files('lib/plugins/i18n.js', ['client', 'server']);
    api.add_files('lib/plugins/record.js', ['client', 'server']);
    api.add_files('lib/plugins/sortable.js', ['client', 'server']);
    api.add_files('lib/plugins/deletable.js', ['client', 'server']);
    api.add_files('lib/plugins/navigation.js', ['client', 'server']);
    api.add_files('lib/plugins/versioning.js', ['client', 'server']);

    api.add_files('lib/models/content.js', ['client', 'server']);

    api.add_files('lib/service.js', ['client', 'server']);

    api.export('CmsInn');
    api.export('RemoteCollectionStorageAdapter', ['client', 'server'], {testOnly: true});
    api.export('AuCmsInn', ['client', 'server'], {testOnly: true});
    api.export('Utilities', ['client', 'server'], {testOnly: true});
    api.export('CmsInnSortable', ['client', 'server'], {testOnly: true});
    api.export('CmsInnRecord', ['client', 'server'], {testOnly: true});
    api.export('CmsInnNavigation', ['client', 'server'], {testOnly: true});
    api.export('CmsInnLocale', ['client', 'server'], {testOnly: true});
    api.export('CmsInni18n', ['client', 'server'], {testOnly: true});
    api.export('CmsInnImage', ['client', 'server'], {testOnly: true});
});

Package.on_test(function (api) {
    api.use('au-cmsinn', ['client', 'server']);

    api.use(['jquery', 'jquery-ui'], ['client']);
    api.use(['mocha-web-sinon'], ['client', 'server']);
    api.use('tinytest', ['client', 'server']);
    api.use('test-helpers', ['client', 'server']);
    api.use('accounts-base', ['client', 'server']);
    api.use('accounts-password', ['client', 'server']);

    api.add_files('test/test_helpers.js', ['client', 'server']);

    api.add_files('test/lib/service.test.js', ['client', 'server']);
    api.add_files('test/lib/utils.test.js', ['client', 'server']);
    api.add_files('test/lib/plugins/sortable.test.js', ['client', 'server']);
    api.add_files('test/lib/plugins/record.test.js', ['client', 'server']);
    api.add_files('test/lib/plugins/navigation.test.js', ['client', 'server']);
    api.add_files('test/lib/plugins/locale.test.js', ['client', 'server']);
    api.add_files('test/lib/plugins/i18n.test.js', ['client', 'server']);
    api.add_files('test/lib/plugins/image.test.js', ['client', 'server']);
});
