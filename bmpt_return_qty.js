/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 *
 * Author : Eko Susanto
 */
define(['N/record'], function (record) {
    function afterSubmit(context) {
        try {
            var currentRecord = context.newRecord;
            if (currentRecord.type === 'vendorreturnauthorization') {
                var poId = currentRecord.getValue({
                    fieldId: 'createdfrom'
                });
                if (poId) {
                    var poRecord = record.load({
                        type: 'purchaseorder',
                        id: poId,
                        isDynamic: true
                    });
                    var itemLines = currentRecord.getLineCount({
                        sublistId: 'item'
                    });
                    for (var i = 0; i < itemLines; i++) {
                        var itemId = currentRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i
                        });
                        var returnQuantity = currentRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: i
                        });
                        var poItemLine = getPOItemLine(poRecord, itemId);
                        if (poItemLine >= 0) {
                            poRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_return_quantity',
                                value: returnQuantity,
                                line: poItemLine
                            });
                        }
                    }
                    poRecord.save();
                }
            }
        } catch (e) {
            log.error({
                title: 'Error setting Return Quantity field',
                details: e.message
            });
        }
    }

    function getPOItemLine(poRecord, itemId) {
        var itemLines = poRecord.getLineCount({
            sublistId: 'item'
        });
        for (var i = 0; i < itemLines; i++) {
            if (poRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                }) === itemId) {
                return i;
            }
        }
        return -1;
    }
    return {
        afterSubmit: afterSubmit
    };
});