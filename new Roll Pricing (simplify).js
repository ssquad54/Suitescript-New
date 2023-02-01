/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define(['N/currentRecord'], function (currentRecord) {
    function beforeSubmit(context) {
        // Check if the context type is either "create" or "edit"
        if (context.type != context.UserEventType.CREATE && context.type != context.UserEventType.EDIT) {
            return;
        }

        // Get the current record
        var record = context.newRecord;

        // Check if the custom form is either 114 or 125
        var customForm = record.getValue({
            fieldId: 'customform'
        });
        if (customForm !== 114 && customForm !== 125) {
            return;
        }

        // Check if the "Grosir" field is set to true
        var grosir = record.getValue({
            fieldId: 'custbody_grosir'
        });
        if (!grosir) {
            return;
        }

        // Initialize an object to store the total quantities of each parent item
        var totalPcs = {};

        // Loop through the sublist of items
        var lineCount = record.getLineCount({
            sublistId: 'item'
        });
        for (var i = 0; i < lineCount; i++) {
            // Get the parent item and quantity for this line item
            var parent = record.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_bmpt_kelompok_roll',
                line: i
            });
            var pcs = record.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_bmpt_pcs',
                line: i
            });

            // Add the quantity to the total quantity for this parent item
            if (!totalPcs[parent]) {
                totalPcs[parent] = 0;
            }
            totalPcs[parent] += pcs;
        }

        // Loop through the sublist of items again
        for (var i = 0; i < lineCount; i++) {
            // Get the parent item and price level for this line item
            var parent = record.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_bmpt_kelompok_roll',
                line: i
            });
            var priceLevel = record.getSublistValue({
                sublistId: 'item',
                fieldId: 'price',
                line: i
            });

            // Set the price level based on the total quantity of the parent item
            if (priceLevel != 22) {
                if (totalPcs[parent] >= 1 && totalPcs[parent] <= 9) {
                    record.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'price',
                        line: i,
                        value: 3
                    });
                } else if (totalPcs[parent] >= 10 && totalPcs[parent] <= 19) {
                    record.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'price',
                        line: i,
                        value: 4
                    });
                } else if (totalPcs[parent] >= 20) {
                    record.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'price',
                        line: i,
                        value: 2
                    });
                }
            }
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };
});