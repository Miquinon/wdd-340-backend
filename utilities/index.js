const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()



/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ************************
 * Builds drop down list for add inventory
 ************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */

// In utilities/index.js

Util.handleErrors = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error("Error caught in utility:", err);
      next(err); 
  });
};






/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* Build html view for vehicle id*/

Util.buildVehicleDetails = function(vehicle) {
  let details = `
    <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
    <img src="/images/vehicles/${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
    <h2>Year: ${vehicle.inv_year}</h2>
    <h2>Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</h2>
    <h2>Mileage: ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</h2>
    <h2>Color: ${vehicle.inv_color}</h2>
    <p>${vehicle.inv_description}</p>
  `;
  return details;
}


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }


 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Check clearance
 * ************************************ */
 Util.checkClearance = (req, res, next) => {
  const accountType = res.locals.accountData?.account_type;
  if (accountType === "Employee" || accountType === "Admin") {
    return next();
  } else {
    req.flash("notice", "You do not have permission to access this page.");
    return res.redirect("/account/login");
  }
};


// // Function to build the vehicle dropdown list based on selected classification
// Util.buildVehicleList = async function (classification_id) {
//   let data = await invModel.getVehiclesByClassification(classification_id);
//   let vehicleList =
//     '<select name="vehicle_id" id="vehicleList" required>';
//   vehicleList += "<option value=''>Choose a Vehicle</option>";

//   data.rows.forEach((row) => {
//     vehicleList +=
//       '<option value="' + row.classification_id + '">' + row.inv_make + "</option>";
//   });

//   vehicleList += "</select>";
//   return vehicleList;
// };




// // Function to build the vehicle dropdown list based on selected classification
// Util.buildVehicleList = async function (classification_id) {
//   let data = await invModel.getVehiclesByClassification(classification_id);
//   let vehicleList =
//     '<select name="classification_id" id="vehicleList" required>';
//   vehicleList += "<option value=''>Choose a Vehicle</option>";

//   data.rows.forEach((row) => {
//     vehicleList +=
//       '<option value="' + row.classification_id + '">' + row.inv_make + "</option>";
//   });

//   vehicleList += "</select>";
//   return vehicleList;
// };


// Function to build the second dropdown based on selected classification
Util.buildModelList = async function (classification_id = null, model_id = null) {
  if (!classification_id) return ''; // If no classification is selected, return an empty string

  let data = await invModel.getModelsByClassification(classification_id); // Fetch models for the classification
  let modelList = '<select name="model_id" id="modelList" required>';
  modelList += "<option value=''>Choose a Model</option>";

  data.rows.forEach((row) => {
    modelList += '<option value="' + row.model_id + '"';
    if (model_id != null && row.model_id == model_id) {
      modelList += " selected ";
    }
    modelList += ">" + row.model_name + "</option>";
  });

  modelList += "</select>";
  return modelList;
}







module.exports = Util;