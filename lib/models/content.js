Content = function(document){
    _.extend(this, document);
};

Content.prototype = {
    constructor: Content
}

ContentCollection = new Meteor.Collection("au-cmsinn-content", {
    transform: function(document){
        return new Content(document)
    }
});

ContentCollection.allow({
    insert: function (userId, doc) {
        // the user must be logged in
        return true;
    },
    update: function (userId, doc, fields, modifier) {
        // the user must be logged in
        return true;
    },
    remove: function (userId, doc) {
        // the user must be logged in
        return true;
    }
});