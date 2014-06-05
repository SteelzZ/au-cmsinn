var contentDep = new Deps.Dependency;
Record = function(){
    this.contentType = 'record';
    this.filters = {};
}

Record.prototype.constructor = Record;

Record.prototype.disable = function(){
    $("[data-au-record]").cmsInnRecord.destroy();  
}

Record.prototype.enable = function(){
    $("[data-au-record]").cmsInnRecord({});
}

Record.prototype.config = function(options){}

Record.prototype.setFilter = function(options){
    var filter = JSON.parse(options);
    if('record' in filter){
        this.filters[filter['record']] = _.extend({sort:{sortOrder:1}}, filter);
    }
    contentDep.changed();
}

Record.prototype.getAll = function(path){
    return ContentCollection.find({
        path: path
    });
}

Record.prototype.query = function(items, parent, limit){
    contentDep.depend();
    if(!(parent in this.filters)){
        this.filters[parent] = {sort:{sortOrder:1}};
    } 

    if(limit != undefined && limit >= 0){
        this.filters[parent]['limit'] = limit;
    } else {
        delete this.filters[parent]['limit'];
    }

    return ContentCollection.find({_id: {$in:items}}, this.filters[parent]);
}

Record.prototype.removeItem = function(itemId){
    var item = ContentCollection.findOne({
        _id: itemId
    });
    if(item){
        var parents = ContentCollection.find({parents:{$in:item['parents']}});

        $.each(item['parents'], function(key, id){
            ContentCollection.update({_id:id}, {
                $pull : {children:itemId}
            });
        })

        ContentCollection.remove({
            _id: itemId
        });
    }
}

CmsInnRecord = new Record();

function generateTree(level, parents){
    var exclude = ["_id", "children", "contentType", "parents", "places", "types"];
    var select = {
        contentType: CmsInnRecord.contentType
    };

    if(parents.length > 0){
        select['_id'] = {};
        select['_id']['$in'] = parents;
    } else {
        select['parents'] = [];
    }

    var options = '';
    var allRecords = ContentCollection.find(select);

    allRecords.forEach(function(record){
        var title = [];
        for(var key in record){
            if(($.inArray(key, exclude)) == -1){
                var item = record[key][CmsInni18n.language];
                if(item){
                    title.push(item);
                }
            }
        }

        if(title.length == 0 && record.children.length > 0){
            title.push('Root');
        }

        options += ' \
            <option value="'+record._id+'">'+Array(level).join('-')+' '+title.join().substr(0, 100)+' ['+record.places.join()+']</option> \
        ';
        if(record.children.length > 0){
            var childLevel = level + 1;
            options += generateTree(childLevel, record.children);
        }
    }); 
    return options;
}

function generateTpl(placeId, fieldId, recordId){

    var addNewItemTpl = ' \
        <div class="clearfix '+placeId+'"> \
            <div class="col-md-12 column"> \
                <div class="row clearfix"> \
                    <div class="col-md-12 column"> \
                        <div class="form-group"> \
                            <select data-record-id="'+recordId+'" data-field-id="'+fieldId+'" data-id="'+placeId+'" class="form-control cmsinn-selected-record"> \
                                <option value="none">Record to be displayed here</option> \
                                '+generateTree(1, [])+' \
                            </select> \
                        </div> \
                    </div> \
                </div> \
                <div class="row clearfix"> \
                    <div class="col-md-12 column"> \
                        <div class="form-group"> \
                            <button type="button" class="btn btn-default btn-block add-new-record" data-record-id="'+recordId+'" data-field-id="'+fieldId+'" data-id="'+placeId+'">Add new record</button> \
                        </div> \
                    </div> \
                </div> \
                <div class="row clearfix"> \
                    <div class="col-md-12 column"> \
                        <div class="form-group"> \
                             <select data-record-id="'+recordId+'" data-field-id="'+fieldId+'" data-id="'+placeId+'" class="form-control cmsinn-selected-parent-record"> \
                                 <option value="none">Record for which you need to create sub record</option> \
                                 '+generateTree(1, [])+' \
                             </select> \
                        </div> \
                    </div> \
                </div> \
                <div class="row clearfix"> \
                    <div class="col-md-12 column"> \
                        <div class="form-group"> \
                            <button type="button" class="btn btn-default btn-block close-record" data-id="'+placeId+'">Close</button> \
                        </div> \
                    </div> \
                </div> \
            </div> \
        </div> \
    ';
    return addNewItemTpl;
}

function insert(parentId, fieldId){
    var record = {
        contentType: CmsInnRecord.contentType,
        parents:[parentId],
        children:[],
        places:[],
        types:[],
        sortOrder: 0
    };

    var latest = ContentCollection.findOne({parents:{$in:[parentId]}}, {sort:{sortOrder:-1}});
    if(latest){
        record['sortOrder'] = ++latest.sortOrder;
    }

    ContentCollection.insert(record, function(err, itemId){
        var update = {
            $addToSet:{}
        };
        if(typeof fieldId == 'string' && fieldId != ''){
            update['$addToSet'][fieldId] = itemId;
        } else {
            update['$addToSet']['children'] = itemId;
        }
        ContentCollection.update({_id:parentId}, update);
    });
}

if(Meteor.isClient){
    (function($) {
        $.fn.cmsInnRecord = function(options) {
            var self = this;
            var settings = $.extend({
                addNewRecord : function(placeId, fieldId){
                    var currentRootItem = ContentCollection.findOne({places:{$in:[placeId]}});
                    $("[data-au-record="+placeId+"]").removeClass('empty-record');
                    // If there is no root item - creat new
                    if(!currentRootItem){
                        ContentCollection.insert({
                            contentType: CmsInnRecord.contentType,
                            places : [placeId],
                            children: [],
                            parents: [],
                            types: []
                        }, function(err, rootId){
                            insert(rootId, fieldId);
                        });
                    } else {
                        insert(currentRootItem._id, fieldId);
                    }
                    contentDep.changed();
                },
                addNewSubRecord : function(parentId, fieldId){
                    var parentRootItem = ContentCollection.findOne({_id:parentId});

                    if(parentRootItem){
                        insert(parentRootItem._id, fieldId);
                    } 
                },
                mapRecord : function(placeId, recordId, fieldId, parentRecordId){
                    if(fieldId != null && fieldId != undefined && fieldId.length > 0){
                        var update = {
                            $addToSet : {}
                        };
                        update['$addToSet'][fieldId] = recordId;
                        ContentCollection.update({_id:parentRecordId}, update);
                    } else {
                        var currentRootItem = ContentCollection.findOne({places:{$in:[placeId]}});
                        if(!currentRootItem){
                            ContentCollection.update({_id:recordId}, {$addToSet:{places:placeId}});
                        } else {
                            ContentCollection.update({_id:currentRootItem._id}, {$pull:{places:placeId}}, function(err, res){
                                ContentCollection.update({_id:recordId}, {$addToSet:{places:placeId}});
                            });
                        }
                    }
                },
                itemAdded : function(placeId){

                }
            }, options);

            function addRecord(){
                settings.addNewRecord($(this).attr('data-id'), $(this).attr('data-field-id'));
            }

            function mapRecord(){
                if($("option:selected", this).val() != 'none'){
                    settings.mapRecord(
                        $(this).attr('data-id'), 
                        $("option:selected", this).val(),
                        $(this).attr('data-field-id'),
                        $(this).attr('data-record-id')
                    );
                }
            }

            function addSubRecord(){
                if($("option:selected", this).val() != 'none'){
                    settings.addNewSubRecord(
                        $("option:selected", this).val(), 
                        $(this).attr('data-field-id')
                    );
                }
            }

            $('body').on('change', '.cmsinn-selected-record', mapRecord);
            $('body').on('change', '.cmsinn-selected-parent-record', addSubRecord);
            $('body').on('click', '.add-new-record', addRecord);

            $.fn.cmsInnRecord.destroy = function() {
                $('body').off('change', '.cmsinn-selected-record', mapRecord);
                $('body').off('change', '.cmsinn-selected-parent-record', addSubRecord);
                $('body').off('click', '.add-new-record', addRecord);

                self.each(function() {
                    $(this).removeClass('empty-record');
                    $(this).removeClass('mark');
                    $(this).popover('destroy');
                    $(this).off('mouseover');
                    $(this).off('shown.bs.popover');
                });

            }

            return this.each(function() {
                var record = this;
                var placeId = $(record).attr('data-au-record').replace(/\//g, '');
                var fields = placeId.match(/\[(([a-z0-9_]*))\]/ig);
                var field = '';
                var recordId = '';
                if(fields != null && fields.length === 1){
                    recordId = placeId.substr(0, placeId.indexOf('['));
                    field = fields[0].replace(/\[/g, '').replace(/\]/g, '');
                }

                //$(record).sortable();
                if($(record).height() == 0) {
                    $(record).addClass('empty-record');
                } 
                $(record).addClass('mark');

                $(record).on('mouseover', function(){
                    $("[data-au-record]").each(function(){
                        if(this != record){
                            $(this).popover('destroy');
                        } 
                    });
                    var placeId = $(record).attr('data-au-record').replace(/\//g, '');
                    var fields = placeId.match(/\[(([a-z0-9_]*))\]/ig);
                    var field = '';
                    var recordId = '';
                    if(fields != null && fields.length === 1){
                        recordId = placeId.substr(0, placeId.indexOf('['));
                        field = fields[0].replace(/\[/g, '').replace(/\]/g, '');
                    }
                    $(record).popover({
                        title: 'Structure',
                        html: true,
                        content : generateTpl(placeId, field, recordId),
                        container: 'body',
                        placement: 'bottom',
                        animation: false
                    });

                    $(record).on('shown.bs.popover', function () {
                        $('.close-record').on('click', function(){
                            $(record).popover('destroy');
                        });  
                    });
                    $(record).popover('show');
                });
            });
        };
    }(jQuery));
    
    if(UI) {
        UI.registerHelper('recordByPlace', function (prefix, placeId) {
            contentDep.depend();
            prefix = prefix === null ? '' : prefix;
            var place = prefix.replace(/\//g, '')+placeId;
            var result = ContentCollection.findOne({places:{$in:[place]}});
            // if(!result){
            //     ContentCollection.insert({
            //         contentType: CmsInnRecord.contentType,
            //         places : [place],
            //         children: [],
            //         parents: [],
            //         types: []
            //     }, function(err, rootId){
            //         insert(rootId);
            //     });
            // }

            return result;
        });

        UI.registerHelper('recordById', function (recordId) {
            return ContentCollection.findOne({_id:recordId});
        });

        UI.registerHelper('sorted', function (items, parent, limit) {
            return CmsInnRecord.query(items, parent, limit);
        });

        UI.registerHelper('paging', function (prefix, placeId, limit) {
            contentDep.depend();
            var result = [];
            prefix = prefix === null ? '' : prefix;
            var place = prefix.replace(/\//g, '')+placeId;
            var parent = ContentCollection.findOne({places:{$in:[place]}});
            if(parent){
                if(!('skip' in CmsInnRecord.filters[parent._id])){
                    CmsInnRecord.filters[parent._id]['skip'] = 0;
                    contentDep.changed();
                }
                if(!('limit' in CmsInnRecord.filters[parent._id])){
                    CmsInnRecord.filters[parent._id]['limit'] = limit;
                    contentDep.changed();
                }

                var pages = Math.ceil(parent.children.length / limit);
                var active = '';
                var page = 0;
                if (CmsInnRecord.filters[parent._id].skip > 0){
                    page = (CmsInnRecord.filters[parent._id].skip / CmsInnRecord.filters[parent._id].limit);
                }
                if(pages > 1){
                    for(var i=0; i<pages; i++){
                        active = page == i ? 'active': '';

                        result.push(
                            {
                                current: i+1,
                                skip: limit*i,
                                limit: limit,
                                isActive: active,
                                forRecord: parent._id
                            }
                        );
                    }
                }

            }
            return result;
        });
    } 
}