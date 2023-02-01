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

        var purchaseOrderSearch = search.create({
            type: search.Type.PURCHASE_ORDER,
            filters: [
                ['custbody_contract_number', 'is', contractNumber],
                'and',
                ['mainline', 'is', 'T'],
                'and',
                ['status', 'anyof', 'PurchOrd:F']
            ],
            columns: ['quantity']
        }).run().getRange(0, 1000);

        var totalQuantity = 0;

        for (var i = 0; i < purchaseOrderSearch.length; i++) {
            var quantity = purchaseOrderSearch[i].getValue({
                name: 'quantity'
            });
            totalQuantity += quantity;
        }

        var contractRecord = record.load({
            type: 'custrecord_bmpt_contract_po',
            id: contractNumber,
            isDynamic: true
        });

        // set the value of 'total qty received' field to the total quantity
        contractRecord.setValue({
            fieldId: 'custrecord_bmpt_total_qty_rec',
            value: totalQuantity
        });

        // calculate the quantity remaining
        var qtyRemaining = contractRecord.getValue({
            fieldId: 'custrecord_bmpt_total_po'
        }) - totalQuantity;

        // set the value of 'quantity remaining' field to the quantity remaining
        contractRecord.setValue({
            fieldId: 'custrecord_bmpt_qty_remaining',
            value: qtyRemaining
        });

        // save the contract record
        contractRecord.save();
    }
    return {
        afterSubmit: afterSubmit
    };
});
