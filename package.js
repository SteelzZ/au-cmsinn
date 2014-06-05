Package.describe({
  summary: "Practical, simple and yet powerfull CMS solution for meteor projects"
});

Npm.depends({
    'gm': '1.16.0'
});

Package.on_use(function (api, where) {
    api.imply(['iron-router']);

    api.use(['underscore', 'ui', 'iron-router', 'deps', 'templating', 'fontawesome4'], ['client', 'server']);
    api.use(['jquery', 'jquery-ui', 'bootstrap-3', 'x-editable-bootstrap3'], ['client']);

    api.add_files('lib/3rd/font-awesome.min.css', ['client']);
    api.add_files('lib/3rd/fonts/fontawesome-webfont.eot', ['client']);
    api.add_files('lib/3rd/fonts/fontawesome-webfont.svg', ['client']);
    api.add_files('lib/3rd/fonts/fontawesome-webfont.ttf', ['client']);
    api.add_files('lib/3rd/fonts/fontawesome-webfont.woff', ['client']);
    api.add_files('lib/3rd/fonts/FontAwesome.otf', ['client']);
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

    api.add_files('lib/models/content.js', ['client', 'server']);
    api.add_files('lib/service.js', ['client', 'server']);

    api.add_files('server/methods.js', ['server']);

    api.export('CmsInn');
});

Package.on_test(function (api) {
    api.use('au-cmsinn', ['client', 'server']);

    api.use('tinytest', ['client', 'server']);
    api.use('test-helpers', ['client', 'server']);
    api.use('accounts-base', ['client', 'server']);
    api.use('accounts-password', ['client', 'server']);

    // api.add_files('test/bh-products-test.js', ['client', 'server']);
    // api.add_files('test/currency-service-test.js', ['client', 'server']);
    // api.add_files('test/product-service-test.js', ['client', 'server']);
});
