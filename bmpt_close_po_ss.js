/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * 
 * Author : Eko Susanto
 */
define(['N/search', 'N/record'], function (search, record) {
    function closePOLine() {
        try {
            var processedIds = [];
            // Search for purchase orders where the "full" field on the purchase order line is checked and the "close" field is not checked
            var poSearch = search.create({
                type: search.Type.PURCHASE_ORDER,
                filters: [
                    ["custcol_bmpt_full", "is", "T"],
                    "AND",
                    ["closed", "is", "F"],
                    "AND",
                    ["formulatext: case when {quantitybilled} = {quantityshiprecv} then 'y' else 'n' end", "is", "y"]
                ],
                columns: [search.createColumn({
                    name: "internalid"
                })]
            });

            // Iterate through the search results
            poSearch.run().each(function (result) {
                if (processedIds.indexOf(result.id) >= 0) {
                    return true;
                }
                processedIds.push(result.id);

                log.debug({
                    title: 'Purchase Order Found',
                    details: result.id
                });
                var poRec = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: result.id
                });
                // Loop through the purchase order lines
                for (var i = 0; i < poRec.getLineCount({
                        sublistId: 'item'
                    }); i++) {
                    var full = poRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_bmpt_full',
                        line: i
                    });
                    if (full) {
                        var qtyBilled = poRec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantitybilled',
                            line: i
                        });
                        var qtyReceipt = poRec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantityreceived',
                            line: i
                        });
                        log.debug({
                            title: 'Checking PO Line',
                            details: i
                        });
                        if (qtyBilled == qtyReceipt) {
                            poRec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'isclosed',
                                line: i,
                                value: true,
                                ignoreFieldChange: true
                            });
                            log.debug({
                                title: 'Closing PO Line',
                                details: i
                            });
                        }
                    }
                }
                poRec.save();
                log.debug({
                    title: 'Saving PO',
                    details: result.id
                });
                return true;
            });
        } catch (e) {
            log.error({
                title: 'Error Closing PO Line',
                details: e
            });
        }
    }
    return {
        execute: closePOLine
    };
});