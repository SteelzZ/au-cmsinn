/**
 * Utility methods available privately to the package.
 */
Utilities = {};

/**
 * Normalize prefix
 *
 * @param {String} value 
 */
Utilities.normalizePrefix = function(value) {
    return value.replace(/\//g, '');
};

/**
 * Parse attribute value and look for pattern RECORD_ID[FIELD]
 * if not found remove all non-alphanumeric chars and return, 
 * because it will be used as id
 *
 * @param {String} value string passed in data-au-* attribute.
 */
Utilities.parseAttr = function(value) {
    var res = value.split(/^((\w+)\[(\w+)\])$/ig);
    if(res.length === 1){
        return {
            recordId : null,
            fieldId: null,
            id: res[0].replace(/\s+/g, '').replace(/\W/g, '')
        };
    }

    return {
        recordId : res[2],
        fieldId: res[3],
        id: res[1]
    };
};

/**
 * Find first string field in record
 *
 * @param {Object} record.
 */
Utilities.firstField = function(record) {
    var exclude = ["_id", "children", "contentType", "parents", "places", "types", "sortOrder"];

    for(var field in record){
        if(exclude.indexOf(field) === -1){
            if(typeof record[field] === 'string' && record[field].length > 0){
                return record[field];
            }
        }
    }

    return '';
};

/**
 * Build title from record
 *
 * @param {Object} record.
 * @param {String} language.
 * 
 * @return {String}
 */
Utilities.buildTitle = function(record, language) {
    var exclude = ["_id", "children", "contentType", "parents", "places", "types", "sortOrder"];

    var title = [];
    for(var field in record){
        if(
            (exclude.indexOf(field) === -1) && 
            (typeof record[field] == 'object') &&
            (language in record[field]) && 
            (typeof record[field][language] === 'string') &&
            (record[field][language].length > 0)
        ){
            title.push(record[field][language]);
        }
    }

    return title.join();
};





