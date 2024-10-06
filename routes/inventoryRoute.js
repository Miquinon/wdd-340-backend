// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);


// Route to build inventory by vehicle detail view
router.get("/detail/:invId", invController.buildByVehicleId);

// Intentional 500 Error Route
router.get("/cause-error", invController.causeServerError);

module.exports = router;

