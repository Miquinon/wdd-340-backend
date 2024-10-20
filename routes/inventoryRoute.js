// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const validate = require('../utilities/inventory-validation')
const utilities = require("../utilities/");

console.log(invController.getAddInventory); 

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);


// Route to build inventory by vehicle detail view
router.get("/detail/:invId", invController.buildByVehicleId);

// Route to display the add-classification view
router.get("/add-classification", invController.buildAddClassification);

// Route for Management view
router.get("/management", utilities.handleErrors(invController.buildManagementView));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit-inventory/:inv_id", utilities.handleErrors(invController.editInventoryView))


router.post("/update/", utilities.handleErrors(invController.updateInventory))


// Route to process the classification form submission
router.post("/add-classification", 
  validate.addClassificationRules(), 
  validate.checkClassificationData, 
  invController.addClassification);

// Route for add-inventory page
router.get("/add-inventory", utilities.handleErrors(invController.buildInventory));


//route to process add inventory form
router.post('/add-inventory', invController.addInventory);

// Intentional 500 Error Route
router.get("/cause-error", invController.causeServerError);







module.exports = router;

