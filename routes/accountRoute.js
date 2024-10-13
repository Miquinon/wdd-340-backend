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
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Error-handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack
  req.flash("notice", "Something went wrong!"); // Optional: Flash message for user feedback
  res.status(500).render('error', { title: 'Error', error: err }); // Render a user-friendly error page
});

// Export the router
module.exports = router;
