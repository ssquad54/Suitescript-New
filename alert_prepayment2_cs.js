/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/ui/dialog'], function (record, search, dialog) {
    var mode;
    var oldPaymentAmount = 0;

    function pageInit(type) {
        mode = type.mode;
        console.log('mode :', mode);

        if (mode == 'edit') {
            oldPaymentAmount = type.currentRecord.getValue({
            fieldId: 'payment'
        });
        }
    }

    function saveRecord(context) {
        // Get the current record
        var currentRecord = context.currentRecord;

        // Get the value of the Purchase Order field
        var purchaseOrderId = currentRecord.getValue({
            fieldId: 'purchaseorder'
        });
        log.debug("po ID", purchaseOrderId);

        if (!purchaseOrderId) {
            log.debug("No Purchase Order selected, exiting script.");
            return;
        }

        var currPaymentAmount = currentRecord.getValue({
            fieldId: 'payment'
        });

        log.debug("Current Prepayment Amount: ", currPaymentAmount);


        // Search for vendor prepayments related to the selected PO
        var prepaymentSearch = search.create({
            type: search.Type.VENDOR_PREPAYMENT,
            filters: [
                ['appliedtotransaction', 'anyof', purchaseOrderId]
            ],
            columns: [
                search.createColumn({
                    name: 'fxamount',
                    summary: search.Summary.SUM
                })
            ]
        });

        var prepaymentAmount = 0;

        prepaymentSearch.run().each(function (result) {
            prepaymentAmount = parseFloat(result.getValue({
                name: 'fxamount',
                summary: search.Summary.SUM
            }) * (-1)) || 0
            return true;
        });

        log.debug("Total prepayment amount for selected PO: ", prepaymentAmount);

        var purchaseRecord = record.load({
            type: record.Type.PURCHASE_ORDER,
            id: purchaseOrderId,
            isDynamic: true
        });

        var totalPo = purchaseRecord.getValue({
            fieldId: 'total'
        });

        log.debug("Total PO: ", totalPo);

        var totalPrepayment = 0;

        if (mode === 'edit') {
            
            totalPrepayment = prepaymentAmount - oldPaymentAmount + currPaymentAmount;
        }
        else {
            totalPrepayment = currPaymentAmount + prepaymentAmount;
        }

        log.debug('totalPrepayment', totalPrepayment);

        if (totalPrepayment > totalPo) {
            dialog.alert({
                title: 'Alert',
                message: 'Total Vendor Prepayment cannot be greater than total Purchase Order'
            });
            return false;
        } else {
            return true;
        }
    }
    return {
        pageInit: pageInit,
        saveRecord: saveRecord
    }
});