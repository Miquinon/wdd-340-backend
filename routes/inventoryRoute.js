// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const validate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);


// Route to build inventory by vehicle detail view
router.get("/detail/:invId", invController.buildByVehicleId);

// Route to display the add-classification view
router.get("/add-classification", invController.buildAddClassification);

// Route to process the classification form submission
router.post("/add-classification", 
  validate.addClassificationRules(), 
  validate.checkClassificationData, 
  invController.addClassification);


// Intentional 500 Error Route
router.get("/cause-error", invController.causeServerError);

module.exports = router;

