# AwareUnit - CMS [![Build Status](https://travis-ci.org/SteelzZ/au-cmsinn.svg?branch=master)](https://travis-ci.org/SteelzZ/au-cmsinn)

## History

###### Current version - In Development, unstable

## About

This is a CMS package for Meteor. This CMS is a bit different then other, because there is no so called "admin console" and everything is managed in frontend. Content editing, structure changes, languages, images, navigation is managed in a "what you see is what you can edit" kinda way. Main goal i am trying to achieve with this package is to make it intuitive, easy to use but at the same time powerful enough.

## Documentation

#### Getting started

To make it easy to start with I have created a sample project that uses this package. As documentation is still "In progress" :), best I can offer is a sample project.

Just create new meteor project:
``` sh
$ mrt create my-cms-project
```

and add this package:
``` sh
$ mrt add au-ui-modern-business
```

Now once you will run your project you will be presented with a "Controls block" through which you will be able to manage your website. Here you can find a screencast that shows how all this works [au-cmsinn intro](http://youtu.be/mJ83sGD33ts).

## Installation

This package can be installed with [Meteorite](https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

``` sh
$ mrt add au-cmsinn
```