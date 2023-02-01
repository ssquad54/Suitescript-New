// @NApiVersion 1.x
// @NScriptType UserEventScript

// name: ABA - Print Surat Jalan (No Barcode)
// id: _aba_printsuratjalannobarcode_ue
// deploy: _aba_*_printbtn

function beforeLoad_UserEventAddButton() {
    var recType = nlapiGetRecordType();
    var internalId = nlapiGetRecordId();

    if (null != recType) {
        if (null != internalId) {
            nlapiLogExecution('DEBUG', 'Check: Record & ID', recType + ' ' + internalId);
            var createPdfUrl = nlapiResolveURL('SUITELET', 'customscript_aba_printsjnb_pdf_sl', 'customdeploy_aba_printsjnb_pdf', false);
            createPdfUrl += '&recordtype=' + recType + '&id=' + internalId;

            //---add a button and call suitelet on click that button and it will open a new window
            //  form.addButton('name/id', 'label', 'buttonscript')
            var arrRecType = ['itemfulfillment']
            if (arrRecType.indexOf(recType) != -1) {
                nlapiLogExecution('DEBUG', 'Check: Record Status', nlapiLookupField(recType, internalId, "status"));
                if (nlapiLookupField(recType, internalId, "status") == 'shipped') {
                    var addButton = form.addButton('custpage_addButton', 'Print Surat Jalan (No Barcode)', "window.open('" + createPdfUrl + "');");
                }
                //  Special case only... if u need to remove Print Button...
                /* if (recType == 'itemfulfillment') {
                form.removeButton('print');
                } */
            }
        } //
        else {
            nlapiLogExecution('DEBUG', 'Error', 'Internal id of the record is null');
        }
    }
}