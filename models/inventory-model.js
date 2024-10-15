const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */

async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


/* ***************************
 *  Get vehicle details by inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0]; // Return the first row
  } catch (error) {
    console.error("Error getting vehicle by ID: " + error);
  }
}


/* ***************************
 *  Add a new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
      const sql = `INSERT INTO classification (classification_name) VALUES ($1) RETURNING *`
      const result = await pool.query(sql, [classification_name])
      return result.rows[0]
  } catch (error) {
      console.error("Error adding classification: " + error)
      return null
  }
}


/* ***************************
 *  add inventory submission
 * ************************** */

async function processAddInventory(req, res) {
  try {
      const { inv_make, inv_model, inv_year, inv_price, inv_description, inv_image, inv_thumbnail, classification_id } = req.body;
      
      // Server-side validation
      if (!inv_make || !inv_model || !inv_year || !inv_price || !classification_id) {
          return res.status(400).send("All required fields must be filled.");
      }

      // Add the new inventory to the database
      const result = await invModel.addNewInventory({
          inv_make,
          inv_model,
          inv_year,
          inv_price,
          inv_description,
          inv_image,
          inv_thumbnail,
          classification_id
          
      });

      if (result) {
          // Redirect to a success page or inventory list
          res.redirect('/inventory/add-inventory');
      } else {
          res.status(500).send("Error adding inventory.");
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
  }
}







module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  processAddInventory
}

