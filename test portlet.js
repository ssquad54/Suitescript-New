/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 */
define(['N/ui/serverWidget'], function (serverWidget) {
    function render(params) {
        var portlet = params.portlet;
        var widget = serverWidget.createWidget({
            type: serverWidget.WidgetType.HTML,
            value: '<b>Welcome to NetSuite!</b>'
        });
        portlet.addChild(widget);
    }

    return {
        render: render
    };
});