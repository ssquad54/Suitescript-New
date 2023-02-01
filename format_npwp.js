/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog'], function (dialog) {

    function formatNPWP(npwp) {
        return npwp.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})(\d{3})(\d{3})/, '$1.$2.$3.$4-$5.$6');
    }

    function isValidNPWP(npwp) {
        return /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}\.\d{3}$/.test(npwp);
    }

    function fieldChanged(scriptContext) {
        var currentRecord = scriptContext.currentRecord;
        var fieldId = scriptContext.fieldId;

        if (fieldId === 'vatregnumber') {
            var npwp = currentRecord.getValue({
                fieldId: 'vatregnumber'
            });

            var numbFormat = npwp.replace(/[A-Za-z\W\s_]+/g, '');
            var numbLength = numbFormat.length;
            if (numbLength != 15) {
                dialog.alert({
                    title: 'Alert',
                    message: 'The NPWP number must be 15 digits.'
                });
            }
        }
    }

    function saveRecord(scriptContext) {
        // Get the current record
        var currentRecord = scriptContext.currentRecord;

        // Get the value of the NPWP field
        var npwp = currentRecord.getValue({
            fieldId: 'vatregnumber'
        });

        // Remove symbol to format the value to correct number format 
        var numbFormat = npwp.replace(/[A-Za-z\W\s_]+/g, '');

        // Get the number count
        var numbLength = numbFormat.length;

        console.log(isValidNPWP(npwp));
        console.log(formatNPWP(npwp));

        //If not valid NPWP format and number count is 15
        //format the number and set NPWP field value to valid NPWP format
        if (!isValidNPWP(npwp) && numbLength == 15) {
            npwp = formatNPWP(npwp);
            currentRecord.setValue({
                fieldId: 'vatregnumber',
                value: npwp
            });
            return true;
            //If not valid NPWP format and number count is not 15
            //Promt Error dialog alert 
        } else if (!isValidNPWP(npwp) && numbLength != 15) {
            dialog.alert({
                title: 'Alert',
                message: 'The NPWP number must be 15 digits.'
            });
            return false;
        }
    }
    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
});