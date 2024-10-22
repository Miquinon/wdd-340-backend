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

/* *****************************
* Get Account by Id
* *************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching id found")
  }
}

/* *****************************
* Update Account 
* *************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id){
  try {
    const sql =
    'UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *'
    const data = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ])
    return data.rows[0]
  } catch (error) {
    console.error("Unable to process account updates.")
  }
}

/* *****************************
* Update Password 
* *************************** */
async function changePassword(account_password, account_id){
  try {
    const sql =
    'UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *'
    const data = await pool.query(sql, [
      account_password,
      account_id,
    ])

    return data.rows[0]
  } catch (error) {
    console.error("Unable to change account password.")
  }
}







  module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, checkExistingEmailUpdate,
    getAccountById, updateAccount, changePassword}