var hooks = {
    'beforeInsert' : function(doc){
        if(CmsInnVersioning.publishCall === false){
            doc['isDraft'] = true;
        }
    },
    'beforeUpdate' : function(selector, modifier, options){
        if(CmsInnVersioning.publishCall === false){
            if(('$addToSet' in modifier) === false && ('$pull' in modifier) === false){
                var current = modifier['$set'];
                modifier['$push'] = {
                    'draft.__statement__' : JSON.stringify(modifier)
                };
                modifier['$set'] = {};
                _.each(current, function(value, key){
                    if(key !== 'draft'){
                        modifier['$set']['draft.'+key] = value;
                    }
                });
            }
        }
    },
    'beforePublish' : function(query, options, userId){
        query['isDraft'] = false;
        options['fields'] = {
            draft : 0
        };
        var superUser = Roles.userIsInRole(userId, CmsInnVersioning.adminRoles);
        if(CmsInnVersioning.insecure === true){
            superUser = true;
        }
        if(superUser){
            delete query['isDraft'];
            delete options['fields'];
        }
    },
}

Version = function(){
    this.storage = null;
    this.hooks = hooks
    this.publishCall = false;
    this.adminRoles = [];
    this.insecure = false;
}

Version.prototype.constructor = Version;

Version.prototype.disable = function(){}

Version.prototype.enable = function(){
    var self = this;
    self.publishAll();
}

Version.prototype.publishAll = function(){
    var self = this;
    self.publishCall = true;

    var cursor = self.storage.collection.find({draft:{$exists:true}}, {fields: {draft:1}});
    cursor.forEach(function(item){
        _.each(item['draft']['__statement__'], function(val){
            var update = JSON.parse(val);
            self.publishCall = true;
            self.storage.update({_id:item._id}, update, {}, function(err, docs){
                self.publishCall = false;
            });
        });
        self.publishCall = true;
        self.storage.update({_id:item._id}, {
            $set : {
                'draft' : {}
            }
        }, {}, function(err, docs){
            self.publishCall = false;
        });
    });

    self.publishCall = true;
    self.storage.update({isDraft:true}, {
        $set : {
            isDraft : false
        }
    }, {multi:true}, function(err, docs){
        self.publishCall = false;
    });
}

Version.prototype.config = function(options){
    var self = this;
    if('adminRoles' in options){
        self.adminRoles = options.adminRoles;
    }

    if('insecure' in options){
        self.insecure = true;
    }
}

CmsInnVersioning = new Version();