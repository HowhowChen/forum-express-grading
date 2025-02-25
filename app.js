if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const path = require('path')
const express = require('express')
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('./config/passport')

const handlebarsHelpers = require('./helpers/handlebars-helpers')
const { getUser } = require('./helpers/auth-helpers')

const { pages, apis } = require('./routes')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'secret'

//  確認與資料庫連線
require('./models')

//  handlebars
app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')

//  middleware: body-parser, json
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//  middleware: method override
app.use(methodOverride('_method'))

//  middleware: use upload dir
app.use('/upload', express.static(path.join(__dirname, 'upload')))

//  middleware: session
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))

//  middle: passport init, passport start session
app.use(passport.initialize())
app.use(passport.session())

//  middleware: flash message
app.use(flash())

//  middleware: locals argument
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = getUser(req)
  next()
})

//  middleware: routes
app.use('/api', apis)
app.use(pages)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
