# AwareUnit - CMS [![Build Status](https://travis-ci.org/SteelzZ/au-cmsinn.svg?branch=master)](https://travis-ci.org/SteelzZ/au-cmsinn)

## History

###### 0.0.9 - In Development, unstable

## About

This is a CMS package for Meteor. This CMS is a bit different in a sense that there is no so called "admin console" and everything is managed in frontend. Content editing, structure changes, languages, images, navigation is managed in a "what you see is what you can edit" kinda way. Main goal i am trying to achieve with this package is to make it intuitive, easy to use but at the same time powerful enough. 

## Installation

This package can be installed with [Meteorite](https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

``` sh
$ mrt add au-cmsinn
```

## Documentation - WORK IN PROGRESS

Current documentation is still very abstract but still, better than nothing. I am working on it to make it as clear as possible so please be patient :).

**Table of Contents**

 - [Getting Started](#getting-started)
 - [Overview](#overview)
 - [Dependencies](#dependencies)
 - [Adding CMS control panel](#adding-cms-control-panel)
 - [Adding labels](#adding-labels)
 - [Adding navigation](#adding-navigation)
 - [Adding images](#adding-images)
 - [Adding record](#adding-records)
 - [Adding sortables and deletables](#adding-sortables-and-deletables)
 - [Adding languages](#adding-languages)
 - [How to create plugins](#how-to-create-plugins)


### Getting started

To make it easy to start with I have created a sample project that uses this package.

Just create new meteor project:
``` sh
$ mrt create my-cms-project
```

and add this package:
``` sh
$ mrt add au-ui-modern-business
```

And you are done. Once you will run your project you will be presented with a "Controls Panel" through which you will be able to manage content of your website. Here is a link where you can find a screencast that shows how all this works [au-cmsinn intro](http://youtu.be/mJ83sGD33ts). 

### Overview

Functionality in this package is built through the plugins. Each plugin serves on single purpose like handles images, translations, records, sorting etc. If you need to extend package for your needs you should be doing it by creating new plugin and registering it within CmsInn object. Plugins does interact with each other and uses API exposed by plugin.

If you do install only this package and not one of already created UI packages you will have to integrate it within your templates by yourself. See documentation below on how each plugin works and how to use them.

### Dependencies

For image handling this package uses [gm](https://github.com/aheckmann/gm) package. So first download and install GraphicsMagick or ImageMagick. In Mac OS X, you can simply use Homebrew and do:

``` sh
brew install imagemagick
brew install graphicsmagick
```

### Adding CMS control panel

First thing you need to do is to add "controls block" in your layout. To do that in your layout template add this:
```html
<template name="layout">
    {{> cmsinn_controls_left}}
    ...
</template>
```

This will bring on controls panel. You can wrap this in `if` statement to check if user is logged in and show it only then.

### Adding labels

In general labels makes your content editable. Package handles which translation to load and all you have to do is to define in your template what kind of label is it. 

To make content editable in your templates, on selected elements add *data-au-label* attribute and give it a unique name/id. Then use `{{c}}` helper to fetch its value, like this:
```html
<template name="layout">
    <div class="navbar-header">
        <a class="navbar-brand" href="#" data-au-label="brand">{{c 'brand'}}</a>
    </div>
</template>
```

As we are using [x-editable](http://vitalets.github.io/x-editable/docs.html) so you can say what type of UI you want to bring up for user by adding *data-type* attribute. So far tested types are these:

* text
* textarea
* date
* wysihtml5

So if you need to use *wysihtml5* type, then in template it would look like this:
```html
<template name="layout">
    <div class="navbar-header">
        <a class="navbar-brand" href="#" data-type="wysihtml5" data-au-label="brand">{{{c 'brand'}}}</a>
    </div>
</template>
```

Note that to output *wysihtml5* value you have to use `{{{c 'label_name'}}}` triple brackets as this wont escape value of label.

And that is it. Once you will load template and will turn on translations mode you will be able to edit content in all your added languages.

### Adding navigation

To add navigation on selected element use *data-au-nav* attribute and give it unique name:

```html
<template name="layout">
    <div class="navbar-header">
        <a class="navbar-brand {{nav 'brand' 'isActive'}}" href="{{nav 'brand' 'href'}}" data-au-nav="brand" data-au-label="brand">{{c 'brand'}}</a>
    </div>
</template>
```

This attribute will bring up navigation UI once navigation mode will be turned on. Over UI you will select template which should be used and also you will have to add url. Under the hood this will translate to:
```javascript
Router.route('unique_route_name', {
    path : '/your-added-url',
    template: 'your-selected-template
});
```

Use `{{nav}}` helper to get uri and check "isActive" state. For example `href="{{nav 'brand' 'href'}}"` this will fetch entered uri for id `'brand'` and `href="{{nav 'brand' 'isActive'}}"` will return string 'active' if current route will match with `'brand'` uri.

As you see above, you can combine attributes on one element. For example same element can have navigation and label attributes. Depending on what mode you will turn on corresponding UI will be presented.

### Adding images

To make editable images add *data-au-image* attribute and use `{{loadImg}}` helper to fetch content.
For example:

```html
<div class="col-md-6">
    <img data-au-image="{{path}}image_name" class="img-responsive" src="{{loadImg 'image_name' '750x450' path}}">
</div>
```

This will allow you to drag an drop image on this element. Defined size in `{{loadImg}}` helper will automatically resize image. So if you need to change size, just change it in template and everything else will be handled.
Every page has `{{path}}` variable passed in by au-cmsinn package. This variable is uri of page you are in. By adding it in front of name you will make this name unique, so in different pages you can have same image name `my-image` but with `{{path}}` you will namespace it.

### Adding records

Records are the most complex bit in this project. Record is something that builds up your dynamic content. Your blog posts, portfolio items, team memebers, languages anything that you want to allow create over CMS has to be done through *data-au-record* attribute. This attribute will bring UI which will allow user to create new record, create sub record for your selected record or select record that user wants to display in specific place on page.

For example below is top menu block. 

```html
<ul class="nav navbar-nav navbar-right" data-au-record="{{path}}top_menu">
{{#with recordByPlace path 'top_menu'}}
    {{#each sorted children _id}}
        {{#with this}}
            {{#if children}}
                <li class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" data-au-nav="{{_id}}" href="{{nav _id 'href'}}"><span data-au-label="{{_id}}[title]">{{c '[title]' _id}}</span><strong class="caret"></strong></a>
                    <ul class="dropdown-menu" data-au-sortable="true">
                        {{#each sorted children _id}}
                            {{#with this}}
                                <li><a data-au-nav="{{_id}}" href="{{nav _id 'href'}}" data-au-label="{{_id}}[title]">{{c '[title]' _id}}</a></li>
                            {{/with}}
                        {{/each}}    
                    </ul>
                </li>
            {{else}}
                <li class="{{nav _id 'isActive'}}">
                    <a data-au-nav="{{_id}}" href="{{nav _id 'href'}}" data-au-label="{{_id}}[title]">{{c 'title' _id}}</a>
                </li>
            {{/if}}
        {{/with}}
    {{/each}}
{{/with}}
</ul>
```

*data-au-record* attribute value is a placeholder id of this block. This value identifies this area/place in given page `{{path}}`. So when you create new record that record will be associated with this placeholder id. When you select some record to be displayed here, that record get this placeholder id. So any record can be displayed in multiple places, but placeholder ids has to be unique. To make sure those are unique we namespace them with `{{path}}`.

`{{recordByPlace}}` helper fetches record and then inside `{{with}}` helper you got all data associated with it. But how you know what data/fields it has? Well in template you define it.
In example above we are creating menu items and every item has `[title]` field. When you are defining *data-au-label* inside record you have to use a little magic while giving a name to label, like this - `data-au-label="{{_id}}[field_name]"`. This will tell cms to store value of this field inside created record. Because when you create global label it is created as separate record in database, but by naming it in given structure it will create `field_name` inside record with id `{{_id}}`. Languages are also handled. So once you will be translating it, this field will have different values for each language.

Another thing to note is that if in template you wont render second level of menu so obviously it wont be visible. But you can have any depth in your structures and then its up to you to decide how many levels you will be displaying. Perhaps in top menu you will display 2 levels but in bottom menu you just want to show first level items, so you will render only first level and will ignore second level.

### Adding sortables and deletables

To make items sortable you have to add *data-au-sortable* attribute with value `true` on parent element of items you want to be able to sort. Then you can "checrry pick" items that you want to be sortable by adding attribute *data-au-sort-order*. Child elements of element that has *data-au-record* attribute by default are made sortable, so you need to add *data-au-sortable* only to sub elements, like in example below. *data-au-sort-order* attribute has to have unique id value, those are used to identify record and update it's sort order in database.

You have to use `{{sorted}}` helper in order get items in correct order. If you will ignore this helper you will get items in wrong order. *children* param tells which records has to be fetched, param `{{_id}}` is parent record id which is used while building filters and for paging. Last param lets you define how many records you want to display here. For example in one page you will want to have all items displayed so you will just ignore last param, but in other page if you need to display just a subset of items, pass number of items you want to be visible there.

To make item deletable add *data-au-deletable* attribute and pass record id as value.

```html
<ul class="nav navbar-nav navbar-right" data-au-record="top_menu">
{{#with recordByPlace '' 'top_menu'}}
    {{#each sorted children _id 10}}
        {{#with this}}
            {{#if children}}
                <li data-au-sort-order="{{_id}}" data-au-deletable="{{_id}}" class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" data-au-nav="{{_id}}" href="{{nav _id 'href'}}"><span data-au-label="{{_id}}[title]">{{c '[title]' _id}}</span><strong class="caret"></strong></a>
                    <ul class="dropdown-menu" data-au-sortable="true">
                        {{#each sorted children _id}}
                            {{#with this}}
                                <li data-au-deletable="{{_id}}" data-au-sort-order="{{_id}}"><a data-au-nav="{{_id}}" href="{{nav _id 'href'}}" data-au-label="{{_id}}[title]">{{c '[title]' _id}}</a></li>
                            {{/with}}
                        {{/each}}    
                    </ul>
                </li>
            {{else}}
                <li data-au-sort-order="{{_id}}" data-au-deletable="{{_id}}" class="{{nav _id 'isActive'}}">
                    <a data-au-nav="{{_id}}" href="{{nav _id 'href'}}" data-au-label="{{_id}}[title]">{{c 'title' _id}}</a>
                </li>
            {{/if}}
        {{/with}}
    {{/each}}
{{/with}}
</ul>
```

Again you can combine all attributes on one element.

### Adding languages

To add languages you need to add *data-au-locale* attribute on element. This will bring UI on selected elements and you will be able to select what locale should be loaded once that element is clicked. 
Here is an example of language menu:

```html
<ul class="nav navbar-nav navbar-right" data-au-record="languages">
{{#with recordByPlace '' 'languages'}}
    {{#each sorted children _id}}
        {{#with this}}
            {{#if children}}
                <li data-au-sort-order="{{_id}}" data-au-deletable="{{_id}}" class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" data-au-nav="{{_id}}" href="{{nav _id 'href'}}"><span data-au-label="{{_id}}[title]">{{c '[title]' _id}}</span><strong class="caret"></strong></a>
                    <ul class="dropdown-menu" data-au-sortable="true">
                        {{#each sorted children _id}}
                            {{#with this}}
                                <li data-au-deletable="{{_id}}" data-au-sort-order="{{_id}}"><a data-au-locale="{{_id}}" data-au-nav="{{_id}}" href="{{nav _id 'href'}}" data-au-label="{{_id}}[title]">{{c '[title]' _id}}</a></li>
                            {{/with}}
                        {{/each}}    
                    </ul>
                </li> 
            {{else}}
                <li data-au-sort-order="{{_id}}" data-au-deletable="{{_id}}" class="{{nav _id 'isActive'}}">
                    <a data-au-locale="{{_id}}" data-au-nav="{{_id}}" href="{{nav _id 'href'}}" data-au-label="{{_id}}[title]">{{c 'title' _id}}</a>
                </li>
            {{/if}}
        {{/with}}
    {{/each}}
{{/with}}
</ul>
```

*data-au-locale* attribute is special in a way that to that element cms binds a function that once you click it, it will set language. `{{id}}` that you pass to this attribute is used to fetch what language user has assigned to it, set it and reload translations.