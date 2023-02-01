// @NApiVersion 1.x
// @NScriptType UserEventScript

// name: ABA - Add Button
// id: _aba_addbtn_ue
// deploy: _aba_*_printbtn

function beforeLoad_UserEventAddButton() {
    var recType = nlapiGetRecordType();
    var internalId = nlapiGetRecordId();

    if (null != recType) {
        if (null != internalId) {
            nlapiLogExecution('DEBUG', 'Check: Record & ID', recType + ' ' + internalId);
            // var createPdfUrl = nlapiResolveURL('SUITELET', 'customscript_suitelet_transferorderpdf', 'customdeploy_transferorderpdf', false);
            var createPdfUrl = nlapiResolveURL('SUITELET', 'customscript_aba_print_pdf_sl', 'customdeploy_aba_print_pdf', false);
            createPdfUrl += '&recordtype=' + recType + '&id=' + internalId;

            //---add a button and call suitelet on click that button and it will open a new window
            //  form.addButton('name/id', 'label', 'buttonscript')
            var arrRecType = ['itemfulfillment','inventorytransfer','expensereport','vendorpayment','deposit']
            if (arrRecType.indexOf(recType) != -1) {
                nlapiLogExecution('DEBUG', 'Check: Record Status', nlapiLookupField(recType, internalId, "status"));
                if (nlapiLookupField(recType, internalId, "status") == 'picked') {
                    var addButton = form.addButton('custpage_addButton', 'Print PDF', "window.open('" + createPdfUrl + "');");
                }
				if (recType == 'inventorytransfer'){
					var addButton = form.addButton('custpage_addButton', 'Print PDF', "window.open('" + createPdfUrl + "');");
				}
              	if (recType == 'expensereport'){
					var addButton = form.addButton('custpage_addButton', 'Print PDF', "window.open('" + createPdfUrl + "');");
				}
              	if (recType == 'vendorpayment'){
					var addButton = form.addButton('custpage_addButton', 'Print PDF', "window.open('" + createPdfUrl + "');");
				}
				if (recType == 'deposit'){
					var addButton = form.addButton('custpage_addButton', 'Print PDF', "window.open('" + createPdfUrl + "');");
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