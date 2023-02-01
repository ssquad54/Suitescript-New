/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/search', 'N/record'], function (search, record) {
    function afterSubmit(context) {
        // Exit the script if the event type is not "create" or "edit"
        if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {
            return;
        }

        var newRecord = context.newRecord;
        var contractNumber = newRecord.getValue({
            fieldId: 'custbody_contract_number'
        });
        // Exit the script if contractNumber field is empty
        if (!contractNumber) return; 

        // Create a search to find purchase orders with the specified contract number
        var totalQuantity = search.create({
            type: search.Type.PURCHASE_ORDER,
            filters: [
                ['custbody_contract_number', 'is', contractNumber]
            ],
            columns: ['quantity']
        }).run().reduce(function (total, current) {
            // Add the quantity of each purchase order found to the total
            return total + current.getValue({
                name: 'quantity'
            });
        }, 0);

        // Load the contract record
        var contractRecord = record.load({
            type: 'custrecord_bmpt_contract_po',
            id: contractNumber,
            isDynamic: true
        });

        // Set the total PO field on the contract record to the total quantity
        contractRecord.setValue({
            fieldId: 'custrecord_bmpt_total_po',
            value: totalQuantity
        });

        // Calculate the outstanding quantity
        var qtyOutstanding = totalQuantity - contractRecord.getValue({
            fieldId: 'custrecord_bmpt_total_qty_rec'
        });

        // Set the outstanding quantity field on the contract record
        contractRecord.setValue({
            fieldId: 'custrecord_bmpt_qty_outstanding',
            value: qtyOutstanding
        });

        // Save the changes to the contract record
        contractRecord.save();
    }
    return {
        afterSubmit: afterSubmit
    };
});
