/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const utilities = require('./utilities/');
const inventoryRoute = require('./routes/inventoryRoute');
const baseController = require("./controllers/baseController")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require('./routes/accountRoute');


/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))


// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})



/* View Engine and Templates */
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") 


/* Serve static files */
app.use(express.static('public'))

/* ***********************
 * Routes
 *************************/
app.use(static)

/* Account Route*/
app.use('/account', accountRoute)


/* Index Route */
app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)

// File Not Found Route - must be last route in list
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav(); 
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  
  let message = err.status === 404 ? err.message : 'Oh no! You took a wrong turn. Maybe try a different route?';
  
  res.status(err.status || 500).render("errors/error", {
      title: err.status || 'Server Error',
      message,
      nav,
  });
});


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! You took a wrong turn. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
