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
  let nav = await utilities.getNav()

  // Insert classification into the database
  const insertResult = await invModel.addClassification(classification_name)

  if (insertResult) {
    nav = await utilities.getNav()
    req.flash("message success", `The ${insertResult.classification_name} classification was successfully added.`)
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
})

/* ***************************
 *  Render the management view
 * ************************** */
invCont.buildManagementView = utilities.handleErrors(async (req, res, next) => {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
  });
});

/* ***************************
 *  Render add-inventory view
 * ************************** */

invCont.buildInventory = async function (req, res, next) {  
  const nav = await utilities.getNav();  
  const classificationSelect = await utilities.buildClassificationList()  
  res.render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    classificationSelect,
    errors: null,
  });}


    


  invCont.addInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const {
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body
  
    const classificationSelect = utilities.buildClassificationList();
    try {
      const data = await invModel.addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      if (data) {
        req.flash("message success", `The ${inv_make} ${inv_model} was successfully added.`)
        res.status(201).render("inventory/edit-inventory", {
          title: 'Inventory Management',
          nav,
          classificationSelect,
          errors: null,
        });
      } else {
        req.flash("message warning", "Sorry, you did not make a new inventory.")
        res.status(501).render("inventory/add-inventory", {
          title: " Add Inventory",
          nav,
          classificationSelect,
          inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,
          errors: null,
        })
      }
    } catch (error) {
      console.error("addInventory error: ", error);
      req.flash("message warning", 'Sorry, there was an error processing the inventory.')
      res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory - Error",
        nav,
        classificationSelect,
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,
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


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/management")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}


/* ***************************
 *  Build Delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
   const itemData = await invModel.getVehicleById(inv_id)
  //  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    flash: req.flash(),
    //  classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    //  classification_id: itemData.classification_id
  })
}


/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id
  } = req.body
  const updateResult = await invModel.deleteInventory(
    inv_id
  )

  if (updateResult) {
    req.flash("notice", `The car was successfully deleted.`)
    res.redirect("/inv/management")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("inventory/delete-confirm", {
    
    })
  }
}








module.exports = invCont;