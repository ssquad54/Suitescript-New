/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */

 define(['N/record', 'N/search'], function(record, search) {
    function pageInit(context) {
        var currentRecord = context.currentRecord;
        var postPeriod = currentRecord.getValue({
            fieldId: 'postingperiod',
        });

        var allLocked = search.lookupFields({
            type: 'accountingperiod',
            id: postPeriod,
            columns: ['alllocked'],
        }).alllocked;

        if (allLocked == 'T') {
            var form = context.form;
            var editButton = form.getButton({
                id: 'edit',
            });

            editButton.isHidden = true;
        }
    }

    return {
        pageInit: pageInit,
    };
});
