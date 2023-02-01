/**
 * @NApiVersion 2.0
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/search'], function (record, search) {
    function onAction(context) {
        var currentRecord = context.newRecord;

        // Get the value of the 'postingperiod' field on the transaction record
        var postingPeriod = currentRecord.getValue({
            fieldId: 'postingperiod',
        });

        // Search for the accounting period associated with the transaction
        var searchResult = search.lookupFields({
            type: 'taskitemstatus',
            id: postingPeriod,
            columns: ['aplocked', 'arlocked', 'alllocked'],
        });

        /* 
        // Get the value of the 'aplocked' field on the accounting period
        var apLocked = searchResult.aplocked;

        // Get the value of the 'arlocked' field on the accounting period
        var arLocked = searchResult.arlocked;
 */
        // Get the value of the 'alllocked' field on the accounting period
        var allLocked = searchResult.alllocked;

        if (allLocked) {
            // Hide the "Edit" button
            var editButton = currentRecord.getButton({
                id: 'edit',
            });

            editButton.isHidden = true;

            // Set the value of the workflow field to the value of the 'alllocked' field
            currentRecord.setValue({
                fieldId: 'your_workflow_field_id',
                value: allLocked,
            });
        }
    }
    return {
        onAction: onAction,
    };
})