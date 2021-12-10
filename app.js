const express = require("express")
const app = express()
const path = require("path")
const mongoose = require('mongoose');
const ejsMate = require("ejs-mate")
const catchAsync = require("./utils/catchAsync")
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require("./schemas.js")
// const Review = require("./model/reviews")

var methodOverride = require('method-override')
app.use(methodOverride('_method'))
// use ejs-locals for all ejs templates (refer to ejs-mate doc)
app.engine("ejs", ejsMate)
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))

// connect to mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); //check database connection
db.once('open', function () {
    console.log("database connected");
});

const validateCamp = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
// import model from other file
const campGroundModel = require("./model/campground");
const Review = require("./model/reviews");

app.set("views", path.join(__dirname, "/views"))
app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("home")
})

//test database to connected
app.get("/campground", async (req, res) => {
    const campgrounds = await campGroundModel.find({})
    res.render("campground/index", { campgrounds })
})

app.get("/campground/new", async (req, res) => {
    res.render("campground/new")
})

app.get("/campground/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await campGroundModel.findById(id).populate("reviews")
    res.render("campground/show", { camp })
}))

app.post("/campground/:id/review", validateReview, catchAsync(async (req, res) => {
    const campground = await campGroundModel.findById(req.params.id);
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campground/${campground._id}`)
}))

app.delete("/campground/:id/review/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await campGroundModel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campground/${id}`)
}))

app.post("/campground", validateCamp, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Not enough information", 404)
    const camp = new campGroundModel(req.body.campground)
    await camp.save()
    res.redirect(`/campground/${camp._id}`)
}))

app.get("/campground/:id/edit", catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await campGroundModel.findById(id)
    res.render("campground/edit", { camp })
}))

app.put("/campground/:id", validateCamp, catchAsync(async (req, res) => {
    const { id } = req.params
    await campGroundModel.findByIdAndUpdate(id, req.body.campground, { new: true, runValidators: true })
    res.redirect(`/campground/${id}`)
}))

app.delete("/campground/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    await campGroundModel.findByIdAndDelete(id) //need to findByIdAndDelete to triger mongoose middleware
    res.redirect("/campground")
}))

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { status = 404 } = err
    if (!err.message) err.message = "!Oh No something went wrong"
    res.status(status).render("error", { err })
})
app.listen(3000)