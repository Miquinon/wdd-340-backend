const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
*  Deliver My Account view
* *************************************** */
async function getMyAccount(req, res, next) {
    let nav = await utilities.getNav();
    res.render('account/account-management', {  
      title: "My Account",         
      nav,
      errors: null,
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
      flash: req.flash(),
      errors: null,
    });
}


/* Deliver sign-up view*/ 

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render('account/registration', {
      title: "Register",
      nav,
      flash: req.flash(),
      errors: null,
  });
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, 
    account_email, account_password } = req.body

// Hash the password before storing
let hashedPassword
try {
  // regular password and cost (salt is generated automatically)
  hashedPassword = await bcrypt.hashSync(account_password, 10)
} catch (error) {
  req.flash("notice", 'Sorry, there was an error processing the registration.')
  res.status(500).render("account/register", {
    title: "Registration",
    nav,
    errors: null,
  })
}


  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )

    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors:null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/registration", {
      title: "Register",
      nav,
    })
  }
  
}


/*User View*/ 

async function buildUserView(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Logged In",
    nav,
    flash: req.flash(),
    errors: null,
  })
  
}


/* Account Management*/ 
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  let accountData = req.session.accountData;
  res.render("inventory/management", {
    title: "Logged In",
    nav,
    accountData,
    flash: req.flash(),
    errors: null,
  })
  
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Build Account Update View
 * ************************************ */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id } = req.params;
  const data = await accountModel.getAccountById(account_id);
  res.render("account/update", {
    title: "Edit Account",
    nav,
    flash: req.flash(),
    account_firstname: data.account_firstname,
    account_lastname: data.account_lastname,
    account_email: data.account_email,
    account_id: data.account_id,
    errors: null,
  })
}

/* Account Update * ***************
********************* */
async function accountUpdate(req, res, next) {  
  const { account_firstname, account_lastname, account_email, account_id, } = req.body  
  let nav = await utilities.getNav()  
  const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id,);  
  if (updateResult) {    
    const updatedName = updateResult.account_firstname + " " + updateResult.account_lastname   
    const accountData = await accountModel.getAccountById(account_id)    
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })    
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })    
    res.redirect("/account")    
    req.flash("notice", `${updatedName}'s account was successfully updated.`)  } 
    else {    req.flash("notice", "Sorry, the update failed.");    
    res.status(501).render("account/update/", {      
      title: "Edit Account",      
      nav,      
      account_firstname,      
      account_lastname,      
      account_email,      
      account_id,      
      errors: null,    
    });  
  }};


  /* **************************************** *  
       Change Password * **********************
  ************** */
 async function changePassword(req, res) {  
  let nav = await utilities.getNav();  
  const { account_password, account_id } = req.body;  
  let hashedPassword;  
  try {hashedPassword = await bcrypt.hashSync(account_password, 10)  } 
  catch (error) {    
    req.flash("notice", "Sorry, there was an error changing your password.");    
    res.status(500).render("account/update", {      
      title: "Edit Account",      
      nav,      
      errors: null,      
      account_id,   
     });  
    }  
    const updateResult = await accountModel.changePassword(hashedPassword, account_id)  
    if (updateResult) {    
      const updatedName = updateResult.account_firstname + " " + updateResult.account_lastname    
      req.flash("notice", `${updatedName}'s password was successfully updated.`)    
      res.redirect("/account")  } 
      else {    req.flash("notice", "Sorry, the password update failed.");    
      res.status(501).render("account/update", {      
        title: "Edit Account",      
        nav,      
        flash: req.flash(),      
        errors: null,      
        account_id,    
      });  
    }}


/* ****************************************
 *  Process logout
 * ************************************ */
async function accountLogout(req, res) {
  // let nav = await utilities.getNav()
   req.flash("notice", "You're logged out.")
   res.clearCookie("jwt");
   return res.redirect("/account")
}

/*Build finance View */

async function buildFinance(req, res, next) {
  try {
    let nav = await utilities.getNav();

    // First dropdown: Classifications
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);

    // Second dropdown: Models (only populated if a classification is selected)
    let modelSelect = "";
    if (req.body.classification_id) {
      modelSelect = await utilities.buildModelList(req.body.classification_id, req.body.inv_make);
    }

    res.render("account/finance", {
      title: "Finance Application",              
      nav,
      classificationSelect,  
      modelSelect,           
      flash: req.flash(),
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

/* Process Finance Form */
async function submitFinanceForm(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      firstname,
      lastname,
      email,
      phone_number,
      street,
      city,
      zip,
      state,
      income,
      employment_status,
      employment_duration
    } = req.body;

    // Basic validation for required fields
    if (
      !firstname ||
      !lastname ||
      !email ||
      !phone_number ||
      !street ||
      !city ||
      !zip ||
      !state ||
      !income ||
      !employment_status ||
      !employment_duration
    ) {
      req.flash("error", "Please fill in all required fields.");
      res.location(req.get("Referer") || "/");

    }


    // Render a confirmation page or redirect with a success message
    res.render("account/finance-confirmation", {
      title: "Finance Application Submitted",
      message: "Your finance application has been successfully submitted!",
      nav,
      flash: req.flash(),
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

/* Build Confirmation View */
async function buildConfirmation(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/finance-confirmation", {
    title: "Finance Application Submitted",
    nav,
    flash: req.flash(),
    errors: null,
  })
  
}







module.exports = { buildLogin, getMyAccount, buildRegister, 
  registerAccount, accountLogin, buildUserView, buildAccountManagement, buildAccountUpdate,
   changePassword, accountLogout, accountUpdate, buildFinance, submitFinanceForm, buildConfirmation};


