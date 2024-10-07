const utilities = require("../utilities/");

/* ****************************************
*  Deliver My Account view
* *************************************** */
async function getMyAccount(req, res, next) {
    let nav = await utilities.getNav();
    res.render('account/login', {  // Reusing the 'login.ejs' file
      title: "My Account",         // Changing the title for the "My Account" view
      nav,
    });
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render('account/login', {
      title: "Login",              // Title for the login page
      nav,
    });
}

module.exports = { buildLogin, getMyAccount };
