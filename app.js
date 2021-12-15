const express = require("express")
const app = express()
const path = require("path")
const mongoose = require('mongoose');
const ejsMate = require("ejs-mate")
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./model/user")

var methodOverride = require('method-override')
app.use(methodOverride('_method'))
// use ejs-locals for all ejs templates (refer to ejs-mate doc)
app.engine("ejs", ejsMate)
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
const sessiontConfig = {
    secret: 'keyboard cat', 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessiontConfig)) //this must be done before passport.initialize() and passport.session()
app.use(flash())

app.use(passport.initialize());
app.use(passport.session()); //not need to login every request
passport.use(new LocalStrategy(User.authenticate())) //User.authenticate() is a method that automatically generate from passport-local-mongoose (UserSchema.plugin(passportLocalMongoose))
passport.serializeUser(User.serializeUser()); //Basically how to store and unstore in the session (only login once and then store the user id in the session)
passport.deserializeUser(User.deserializeUser()); //Basically how to store and unstore in the session (login in each request)

app.use((req, res, next) => {
    res.locals.currentUser = req.user; //need to passport.serializeUser() and passport.deserializeUser() first before req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.set("views", path.join(__dirname, "/views"))
app.set("view engine", "ejs")

app.get("/fakeUser", async (req, res) => {
    const user = new User({email: 'colt@gmail.com', username: "colt"})
    const newUser = await User.register(user, 'password'); //user register method to add new user
    res.send(newUser)
})
const campgroundsRoutes = require("./routes/campgrounds")
const reviewsRoutes = require("./routes/reviews")
const usersRoutes = require("./routes/users")

// connect to mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); //check database connection
db.once('open', function () {
    console.log("database connected");
});

app.get("/", (req, res) => {
    res.render("home")
})

app.use("/", usersRoutes)
app.use("/campground", campgroundsRoutes)
app.use("/campground/:id/review", reviewsRoutes)

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { status = 404 } = err
    if (!err.message) err.message = "!Oh No something went wrong"
    res.status(status).render("error", { err })
})
app.listen(3000)