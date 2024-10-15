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
  const nav = await utilities.getNav();
  res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
  });
});

/* ***************************
 *  Render add-inventory view
 * ************************** */
// invCont.getAddInventory = utilities.handleErrors(async (req, res, next) => {
//   let nav = await utilities.getNav();
//   res.render("inventory/add-inventory", {
//       title: "Add Inventory",
//       nav,
//       errors: null,
//   });
// });

// invCont.buildInventory = async function (req, res, next) {
//   const nav = await utilities.getNav();
//   const classification = await invModel.getClassifications();
//   const inventoryList = await utilities.getInv();
//   res.render('inventory/add-inventory', {
//     title: 'Add Inventory',
//     nav,
//     classification,
//     inventoryList,
//     flash: req.flash(),
//     errors: null,
//   });

// }

invCont.buildInventory = async function (req, res, next) {
  const nav = await utilities.getNav();
  const classification = await invModel.getClassifications();
  const inventoryList = await utilities.getInv(); // Ensure this function is implemented properly
  res.render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    classification,
    inventoryList,
    flash: req.flash(),
    errors: null,
    locals: { // Make sure you include locals
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_image: '',
      inv_thumbnail: '',
      inv_price: '',
      inv_miles: '',
      inv_color: '',
      classification_id: ''
    }
  });
}



invCont.addInventory = async function (req, res, next) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let nav = await utilities.getNav()
  let classification = await invModel.getClassifications();
  try {
    const data = await invModel.addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
    if (data) {
      req.flash(
        "notice",
        `Congratulations, you did it!`
      )
      res.status(201).render("inventory/management", {
        title: 'Inventory Management',
        nav,
        classification,
        flash: req.flash(),
        errors: null,
      });
    } else {
      req.flash("notice", "Sorry, you did not make a new inventory.")
      res.status(501).render("inventory/add-inventory", {
        title: " Add Inventory",
        nav,
        classification,
        inventoryList,
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,
        flash: req.flash(),
        errors: null,
      })
    }
  } catch (error) {
    console.error("addInventory error: ", error);
    req.flash("notice", 'Sorry, there was an error processing the inventory.')
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory - Error",
      nav,
      classification,
      inventoryList,
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,
      flash: req.flash(),
      errors: null,
    });
  }
};


// Intentionally causing an error

invCont.causeServerError = (req, res, next) => {
  try {
    throw new Error("Intentional 500 Server Error");
  } catch (err) {
    next(err); 
  }
};


module.exports = invCont;