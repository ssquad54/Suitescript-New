function TestBeforeLoad(type) {
    // Get the User's role
    var role = nlapiGetRole();
    var userName = nlapiGetUser()

    if (type == 'create') {
        // This throws an Error for the user that Creating a new record is not allowed. 
        // User can click on the message to go back to the previous page. 
        throw nlapiCreateError('Action not allowed',
            'Your role is not permitted to Add this type of Record. ' +
            '<br><br> role ' + role + ' username ' + userName +
            '<br><br> Please click <a href="javascript:history.go(-1)">' +
            'here</a> to go back.');
    }
}