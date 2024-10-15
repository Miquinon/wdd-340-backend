const invModel = require("../models/inventory-model")
const Util = {}



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

module.exports = Util;




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


// utilities.js
async function getInv() {
  try {
    const result = await invModel.getAllInventory(); // Example function call, adjust as necessary
    return result.rows;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return []; // Return an empty array or handle the error as needed
  }
}
