/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/error'], function (runtime, error) {
    function beforeLoad(context) {
        // Get the User's role
        var myUser = runtime.getCurrentUser();
        var userRole = myUser.role;

        if (context.type == 'create') {
            // This throws an Error for the user that Creating a new record is not allowed. 
            // User can click on the message to go back to the previous page. 
            throw error.create({
                name: 'Action not allowed',
                message: 'Your role is not permitted to Add this type of Record. ' +
                    'myUser : ' + myUser + 'userRole : ' + userRole +
                    'Please click <a href="javascript:history.go(-1)">here</a> to go back.'
            });
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});