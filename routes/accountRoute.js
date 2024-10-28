// Required
const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation')



// This route will call a function from the account controller
router.get('/login', accountController.buildLogin); 

// This route for My Account
router.get('/', accountController.getMyAccount); 

//This route will call the function from account controller
router.get('/register', accountController.buildRegister);

//Route for registration data and Process the registration data
router.post(
  "/register",
  regValidate.validate.registationRules(),
  regValidate.validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

//Route to post login 
router.post("/login",
  regValidate.loginValidate.loginRules(),
  regValidate.loginValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);


// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

// Default route for logged-in users
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildUserView));


router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

//Route to Logout
router.get('/logout', utilities.handleErrors(accountController.accountLogout));

//Route to Account Management
router.get("/account-management",utilities.handleErrors(accountController.buildAccountManagement))

//Route to Update Account View
router.get("/update/:account_id", 
// utilities.checkLogin,
utilities.handleErrors(accountController.buildAccountUpdate));



//Route to account update
router.post("/account-update", utilities.handleErrors(accountController.accountUpdate)); 



//Route to change password
router.post("/change-password", utilities.handleErrors(accountController.changePassword));



// Error-handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack
  req.flash("notice", "Something went wrong!"); // Optional: Flash message for user feedback
  res.status(500).render('error', { title: 'Error', error: err }); // Render a user-friendly error page
});


//Finace view
router.get('/finance', utilities.handleErrors(accountController.buildFinance));


//Submit Finance
router.post('/account-management', utilities.handleErrors(accountController.submitFinanceForm)); 

//Finance Confirmation
router.get('/finance-confirmation', utilities.handleErrors(accountController.buildConfirmation));






// Export the router
module.exports = router;
