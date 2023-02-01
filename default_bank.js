/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record'], function (record) {
    function fieldChanged(context) {
        // Get the current record
        var currentRecord = context.currentRecord;

        // Check if the changed field is the vendor field
        if (context.fieldId === 'entity') {
            // Get the vendor ID from the current record
            var vendorId = currentRecord.getValue({
                fieldId: 'entity'
            });

            // Load the vendor record
            var vendorRecord = record.load({
                type: record.Type.VENDOR,
                id: vendorId,
                isDynamic: true
            });

            // Get the number of lines in the bank information sublist
            var lineCount = vendorRecord.getLineCount({
                sublistId: 'recmachcustrecord_tem_link_to_vendor'
            });

            // Initialize a variable to store the largest internal ID
            var largestInternalId = 0;
            var bankLine = 0;

            // Loop through the sublist
            for (var i = 0; i < lineCount; i++) {
                // Get the value of the default field for the current line
                var isDefault = vendorRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_tem_link_to_vendor',
                    fieldId: 'custrecordtem_default_bank',
                    line: i
                });
                // Check if the default field is checked
                if (isDefault) {
                    // Get the internal ID for the current line
                    var internalId = vendorRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tem_link_to_vendor',
                        fieldId: 'id',
                        line: i
                    });

                    // Check if the internal ID is larger than the current largest internal ID
                    if (internalId > largestInternalId) {
                        // Update the largest internal ID
                        largestInternalId = internalId;
                        bankLine = i;
                    }
                }
            }

            // Check if there is at least one default bank information record
            if (largestInternalId > 0) {
                // Get the bank information for the default bank information record with the largest internal ID
                var destAccount = vendorRecord.getSublistText({
                    sublistId: 'recmachcustrecord_tem_link_to_vendor',
                    fieldId: 'name',
                    line: bankLine
                });

                // Set the bank info field on the current record to the default bank information
                currentRecord.setValue({
                    fieldId: 'custbody_tem_pay_dest_account',
                    value: destAccount
                });
            }
        }
    }

    return {
        fieldChanged: fieldChanged
    };
});