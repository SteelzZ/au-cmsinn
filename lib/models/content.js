Content = function(document){
    _.extend(this, document);
};

Content.prototype = {
    constructor: Content,

    get : function(name){
        if(_.has(this, 'draft') && _.isObject(this.draft) && _.has(this.draft, name)){
            return this.draft[name];
        } else if (_.has(this, name)){
            return this[name];
        }

        return null;
    },

    findField : function(contentType){
        var fields = this;
        if(_.has(this, 'draft') && _.isObject(this.draft) && !_.isEmpty(this.draft)){
            fields = this.draft;
        } 
        
        for(var field in fields){
            if(_.has(fields[field], 'contentType') && fields[field]['contentType'] === contentType){
                fields[field]['_id'] = this._id;
                return fields[field];
            }
        }


        return null;
    },

    firstFieldWithValue : function(inField){
        var exclude = ["_id", "children", "contentType", "parents", "places", "types", "sortOrder", "isDraft", "draft"];

        var lookup = {};
        if(_.isUndefined(inField)){
            for(var field in this){
                if(_.indexOf(exclude, field, true)){
                    if(_.isString(this.get(field)) && this.get(field) !== ''){
                        return this.get(field);
                    }
                }
            }
        } else if(_.has(this, inField)){
            for(var field in this[inField]){
                if(_.indexOf(exclude, field, true)){
                    if(_.isString(this[inField][field]) && this[inField][field] !== ''){
                        return this[inField][field];
                    }
                }
            }
        }

        return '';
    }
}

ContentCollection = new Meteor.Collection("au-cmsinn-content", {
    transform: function(document){
        return new Content(document)
    }
});

// ContentCollection.allow({
//     insert: function (userId, doc) {
//         // the user must be logged in
//         return true;
//     },
//     update: function (userId, doc, fields, modifier) {
//         // the user must be logged in
//         return true;
//     },
//     remove: function (userId, doc) {
//         // the user must be logged in
//         return true;
//     }
// });