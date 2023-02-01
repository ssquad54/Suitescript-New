/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/log'], function (search, log) {
    function pageInit(context) {
        try {
            log.debug('context mode', context.mode);
            if (context.mode !== 'create' && context.mode !== 'copy')
                return;
            // Get the current record
            var currentRecord = context.currentRecord;

            // Get the vendor ID from the current record
            var vendorId = currentRecord.getValue({
                fieldId: "entity"
            });

            // Create search and run it to find default bank information record
            var bankSearch = search.create({
                type: "customrecord_tem_bank_account_number",
                filters: [
                    ["custrecord_tem_link_to_vendor", search.Operator.IS, vendorId],
                    "AND",
                    ["custrecordtem_default_bank", search.Operator.IS, "T"]
                ],
                columns: [search.createColumn({
                    name: "internalid",
                    sort: search.Sort.DESC
                }), "name"]
            }).run().getRange(0, 5);
            log.debug('bankSearch', bankSearch);

            log.debug('bankSearch.length', bankSearch.length);

            // Check if at least one default bank information record was found
            if (bankSearch.length > 0) {
                // Retrieve the internalid field from the default bank information record
                var destAccount = bankSearch[0].getValue({
                    name: "internalid"
                });

                log.debug('destAccount', destAccount);

                // Set the payment destinaton account field to the default bank information
                setTimeout(function () {
                    //Add a timeout of 100 milliseconds because the field is a list filtered by vendor 
                    // and it takes time to load the list of values
                    currentRecord.setValue({
                        fieldId: "custbody_tem_pay_dest_account",
                        value: destAccount
                    });
                }, 100);
            }
        } catch (e) {
            log.error("An error occurred", e);
        }
    }

    function fieldChanged(context) {
        try {
            // Get the current record
            var currentRecord = context.currentRecord;

            // Check if the changed field is the vendor field
            if (context.fieldId === "entity") {
                // Get the vendor ID from the current record
                var vendorId = currentRecord.getValue({
                    fieldId: "entity"
                });

                // Create search and run it to find default bank information record
                var bankSearch = search.create({
                    type: "customrecord_tem_bank_account_number",
                    filters: [
                        ["custrecord_tem_link_to_vendor", search.Operator.IS, vendorId],
                        "AND",
                        ["custrecordtem_default_bank", search.Operator.IS, "T"]
                    ],
                    columns: [search.createColumn({
                        name: "internalid",
                        sort: search.Sort.DESC
                    }), "name"]
                }).run().getRange(0, 5);
                log.debug('bankSearch', bankSearch);

                log.debug('bankSearch.length', bankSearch.length);

                // Check if at least one default bank information record was found
                if (bankSearch.length > 0) {
                    // Retrieve the internalid field from the default bank information record
                    var destAccount = bankSearch[0].getValue({
                        name: "internalid"
                    });

                    log.debug('destAccount', destAccount);

                    // Set the payment destinaton account field to the default bank information
                    setTimeout(function () {
                        //Add a timeout of 100 milliseconds because the field is a list filtered by vendor 
                        // and it takes time to load the list of values
                        currentRecord.setValue({
                            fieldId: "custbody_tem_pay_dest_account",
                            value: destAccount
                        });
                    }, 100);
                }
            }
        } catch (e) {
            log.error("An error occurred", e);
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged
    };
});