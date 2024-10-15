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


/* ***************************
 *  Build add-classification view
 * ************************** */
invCont.buildAddClassification = utilities.handleErrors(async (req, res, next) => {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
  })
})

/* ***************************
*  Process classification submission
* ************************** */
invCont.addClassification = utilities.handleErrors(async (req, res, next) => {
  const { classification_name } = req.body
  const nav = await utilities.getNav()

  // Insert classification into the database
  const result = await invModel.addClassification(classification_name)

  if (result) {
      req.flash("notice", `New classification "${classification_name}" has been added.`)
      res.status(201).render("inventory/management", { title: "Inventory Management", nav, flash: req.flash() })
  } else {
      req.flash("notice", "Sorry, the insertion failed.")
      res.status(500).render("inventory/add-classification", { title: "Add Classification", nav, errors: null })
  }
})

/* ***************************
 *  Render the management view
 * ************************** */
invCont.buildManagementView = utilities.handleErrors(async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
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