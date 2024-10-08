// Required
const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');

// This route will call a function from the account controller
router.get('/login', accountController.buildLogin); 

// This route for My Account
router.get('/', accountController.getMyAccount); 

//This route will call the function from account controller
router.get('/register', accountController.buildRegister);

// Error-handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Export the router
module.exports = router;
