const utilities = require("../utilities/");

/* ****************************************
*  Deliver My Account view
* *************************************** */
async function getMyAccount(req, res, next) {
    let nav = await utilities.getNav();
    res.render('account/login', {  
      title: "My Account",         
      nav,
    });
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render('account/login', {
      title: "Login",              
      nav,
    });
}


/* Deliver sign-up view*/ 

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render('account/registration', {
      title: "Register",
      nav,
  });
}

module.exports = { buildLogin, getMyAccount, buildRegister };
