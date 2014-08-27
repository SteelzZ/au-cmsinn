if(Meteor.isServer){
    Meteor.methods({
        '/au-cmsinn/storage/update' : function(options){
           //try{
                var result = ContentCollection.update(options.selector, options.modifier, options.options);
                return result;
            //} catch (e){
            //    console.log(e);
            //}
        },
        '/au-cmsinn/storage/insert' : function(options){
            //try{
                var result = ContentCollection.insert(options.doc);
                return result;
            //} catch (e){
            //    console.log(e);
            //}
        },
        '/au-cmsinn/storage/remove' : function(options){
            //try{
                var result = ContentCollection.remove(options.selector);
                return result;
            //} catch (e){
            //    console.log(e);
            //}
        }
    });
}

/**
 * Implementation that uses Meteor.apply()
 */
RemoteCollectionStorageAdapter = function(){
    this.live = true;
    this.collection = ContentCollection;
}

RemoteCollectionStorageAdapter.prototype.constructor = RemoteCollectionStorageAdapter;

RemoteCollectionStorageAdapter.prototype.update = function(selector, modifier, options, callback){
    var callOptions = {
        selector : selector,
        modifier : modifier,
        options: options
    };
    Meteor.apply('/au-cmsinn/storage/update', [callOptions], callback);
}

RemoteCollectionStorageAdapter.prototype.insert = function(doc, callback){
    var callOptions = {
        doc : doc
    };
    Meteor.apply('/au-cmsinn/storage/insert', [callOptions], callback);
}

RemoteCollectionStorageAdapter.prototype.remove = function(selector, options, callback){
    var callOptions = {
        selector : selector,
        options: options
    };
    Meteor.apply('/au-cmsinn/storage/remove', [callOptions], callback);
}