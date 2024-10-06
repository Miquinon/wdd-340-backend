const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async (req, res, next) => {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    
    if (!data || data.length === 0) {
        return next({ status: 404, message: "No vehicles found for this classification." });
    }

    const grid = await utilities.buildClassificationGrid(data);
    const className = data[0].classification_name;
    const nav = await utilities.getNav(); // Ensure to get the nav for error handling

    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    });
});

/* ***************************
 *  Build inventory by vehicle detail view
 * ************************** */
invCont.buildByVehicleId = utilities.handleErrors(async (req, res, next) => {
    const invId = req.params.invId;
    const vehicle = await invModel.getVehicleById(invId);

    if (!vehicle) {
        return next({ status: 404, message: "Vehicle not found" });
    }

    const nav = await utilities.getNav();
    const vehicleDetails = utilities.buildVehicleDetails(vehicle);
    
    res.render("inventory/detail", {
        title: `${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        vehicleDetails,
        vehicle,
    });
});


// Intentionally causing an error

invCont.causeServerError = (req, res, next) => {
  try {
    throw new Error("Intentional 500 Server Error");
  } catch (err) {
    next(err); 
  }
};


module.exports = invCont;