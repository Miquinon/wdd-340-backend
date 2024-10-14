const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */
validate.addClassificationRules = () => {
    return [
        body("classification_name")
          .trim()
          .escape()
          .notEmpty()
          .isLength({ min: 1 })
          .withMessage("Classification name is required.")
          .matches(/^[a-zA-Z0-9]+$/)
          .withMessage("Classification name must not contain spaces or special characters.")
    ]
}

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors: errors.array(),
            title: "Add Classification",
            nav,
        })
        return
    }
    next()
}

module.exports = validate
