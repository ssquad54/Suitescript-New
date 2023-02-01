/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

 define(['N/ui/serverWidget', 'N/log'], (serverWidget, log) => {
    function beforeLoad(context) {
        if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT) {
            disableColumnField(context.form, 'item', 'price');
            hideColumnField(context.form, 'item', 'amount');
        }
    }
    function disableColumnField(formObj, sublistId, fieldId) {
        try {
            const formSublist = formObj.getSublist({
                id: sublistId
            });
            if (formSublist) {
                const formField = formSublist.getField({
                    id: fieldId
                });
                if (formField && typeof formField !== 'undefined' && formField !== null) {
                    formField.updateDisplayType({
                       displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                }
            }
        } catch(error) {
            log.error({
                title: 'Error occurred when disable field',
                details: JSON.stringify({
                    sublistId: sublistId,
                    fieldId: fieldId
                })
            });
        }
    }

    function hideColumnField(formObj, sublistId, fieldId) {
        try {
            const formSublist = formObj.getSublist({
                id: sublistId
            });
            if (formSublist) {
                const formField = formSublist.getField({
                    id: fieldId
                });
                if (formField && typeof formField !== 'undefined' && formField !== null) {
                    formField.updateDisplayType({
                       displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
                }
            }
        } catch(error) {
            log.error({
                title: 'Error occurred when hiding field',
                details: JSON.stringify({
                    sublistId: sublistId,
                    fieldId: fieldId
                })
            });
        }
    }
    return {
        beforeLoad: beforeLoad
    };
});