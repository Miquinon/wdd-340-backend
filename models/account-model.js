const pool = require("../database/")




/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, 
  account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }


/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}


/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


/* *****************************
* Update email address
* ***************************** */
async function checkExistingEmailUpdate(account_email, account_id){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1 AND account_id != $2"
    const email = await pool.query(sql, [account_email, account_id])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}




async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id]
    );

    if (result.rows.length === 0) {
      // If no account is found, you can throw an error or return null
      throw new Error("No matching id found");
    }

    return result.rows[0]; // Return the found account
  } catch (error) {
    console.error("Error fetching account by ID:", error.message);
    throw error; // Propagate the error for handling in the calling function
  }
}



//Update Account

async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = `
      UPDATE public.account 
      SET account_firstname = $1, 
          account_lastname = $2, 
          account_email = $3 
      WHERE account_id = $4 
      RETURNING *`;

    const data = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);

    if (data.rows.length === 0) {
      // If no rows were updated, the account_id might be invalid
      throw new Error("Account not found or no changes made.");
    }

    return data.rows[0]; // Return the updated account data
  } catch (error) {
    console.error("Unable to process account updates:", error.message);
    throw error; // Throw the error to be handled by the calling function
  }
}




//Change Password

async function changePassword(newPassword, account_id) {  
  try {   
     //  Hash the new password before storing it    
    //const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds    
    const sql = `UPDATE public.account   SET account_password = $1 WHERE account_id = $2  RETURNING *`;    
    const data = await pool.query(sql, [ newPassword, account_id, ]);    
    if (data.rows.length === 0) {      // If no rows were updated, the account_id might be invalid      
      throw new Error("Account not found or no changes made.");    }    
      return data.rows[0]; // Return the updated account data  
    } catch (error) {console.error("Unable to change account password:", error.message); throw error; // Throw the error to be handled by the calling function  
  }}




  module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, checkExistingEmailUpdate,
    getAccountById, updateAccount, changePassword}