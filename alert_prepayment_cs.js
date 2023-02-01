/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/dialog'], function (record, dialog) {
    function saveRecord(context) {
        // Get the current record
        var currentRecord = context.currentRecord;

        // Get the Value of the Purchase Order Field 
        var createdFrom = currentRecord.getValue({
            fieldId: 'purchaseorder'
        });

        if (!createdFrom)
            return;

        var paymentAmount = currentRecord.getValue({
            fieldId: 'payment'
        });

        var purchaseRecord = record.load({
            type: record.Type.PURCHASE_ORDER,
            id: createdFrom,
            isDynamic: true
        });

        var totalPo = purchaseRecord.getValue({
            fieldId: 'total'
        });

        if (paymentAmount > totalPo) {
            dialog.alert({
                title: 'Alert',
                message: 'Total Vendor Prepayment tidak boleh lebih besar dari total Purchase Order'
            });
            return false;
        }
        else {
            return true;
        }
    }
    return {
        saveRecord: saveRecord
    }
});