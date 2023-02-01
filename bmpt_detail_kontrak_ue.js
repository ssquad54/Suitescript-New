/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/record'], function (search, record) {
    function beforeLoad(context) {

        log.debug({
            title: 'mode',
            details: context.type
        });

        if (context.type !== context.UserEventType.VIEW)
            return;


        // Get the current record
        var currentRecord = context.newRecord;

        // Get the contract number from the record
        var contractNo = currentRecord.getValue({
            fieldId: 'id'
        });

        log.debug({
            title: 'contractNo',
            details: contractNo
        });

        // Get the contract Quantity from the record
        var contractQuantity = currentRecord.getValue({
            fieldId: 'custrecord_bmpt_kontrak_quantity'
        });

        // Create a search for purchase orders with the contract number filter
        var poSearch = search.create({
            type: search.Type.PURCHASE_ORDER,
            filters: [
                ['custbody_bmpt_contract_no', 'anyof', contractNo],
                "AND",
                ["mainline", "is", "F"],
                "AND",
                ["taxline", "is", "F"],
                "AND",
                ["shipping", "is", "F"]
            ],
            columns: [
                search.createColumn({
                    name: 'quantity',
                    summary: search.Summary.SUM
                })
            ]
        });

        // Initialize the total PO quantity
        var totalPo = 0;

        // Iterate over the search results
        poSearch.run().each(function (result) {
            // Add the current PO's quantity to the total PO quantity
            totalPo = parseFloat(result.getValue({
                name: 'quantity',
                summary: search.Summary.SUM
            }));
            return true;
        });

        log.debug({
            title: 'Total PO Quantity',
            details: totalPo
        });

        // Add a filter to the search to find only POs with received quantity
        poSearch.filters.push(search.createFilter({
            name: 'quantityshiprecv',
            operator: search.Operator.GREATERTHAN,
            values: '0'
        }));

        // Initialize the total received quantity
        var totalReceipt = 0;

        // Iterate over the search results
        poSearch.run().each(function (result) {
            // Add the current PO's received quantity to the total received quantity
            totalReceipt = parseFloat(result.getValue({
                name: 'quantity',
                summary: search.Summary.SUM
            }));
            return true;
        });

        log.debug({
            title: 'Total Received Quantity',
            details: totalReceipt
        });

        // Calculate the outstanding quantity (total PO - total received)
        var outstanding = totalPo - totalReceipt;

        // Calculate the remaining quantity (contract quantity - total PO)
        var remaining = contractQuantity - totalPo;

        //load contract record
        var contractRecord = record.load({
            type: 'customrecord_bmpt_detail_kontrak',
            id: contractNo,
            isDynamic: true
        });

        // Set the calculated values to the appropriate fields on the record
        contractRecord.setValue({
            fieldId: 'custrecord_bmpt_kontrak_total_qty_po',
            value: totalPo
        });
        contractRecord.setValue({
            fieldId: 'custrecord_bmpt_kontrak_total_qty_rec',
            value: totalReceipt
        });
        contractRecord.setValue({
            fieldId: 'custrecord_bmpt_kontrak_qty_outstanding',
            value: outstanding
        });
        contractRecord.setValue({
            fieldId: 'custrecord_bmpt_kontrak_qty_remaining',
            value: remaining
        });

        contractRecord.save();

    }
    return {
        beforeLoad: beforeLoad
    };
});