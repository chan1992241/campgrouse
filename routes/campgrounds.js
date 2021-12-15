const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError')
const catchAsync = require("../utils/catchAsync")
const campGroundModel = require("../model/campground");
const { campgroundSchema } = require("../schemas.js")
const {isLoggedIn} = require("../middleware.js")

const validateCamp = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

router.get("/", async (req, res) => {
    const campgrounds = await campGroundModel.find({})
    res.render("campground/index", { campgrounds })
})

router.get("/new", isLoggedIn, async (req, res) => {
    res.render("campground/new")
})

router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await campGroundModel.findById(id).populate("reviews")
    if (!camp){
        req.flash("error", "Campground not found")
        res.redirect("/campground")
    }
    res.render("campground/show", { camp })
}))

router.post("/", isLoggedIn ,validateCamp, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Not enough information", 404)
    const camp = new campGroundModel(req.body.campground)
    await camp.save()
    req.flash("success", "Campground created successfully")
    res.redirect(`/campground/${camp._id}`)
}))

router.get("/:id/edit",isLoggedIn , catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await campGroundModel.findById(id)
    if (!camp){
        req.flash("error", "Campground not found")
        res.redirect("/campground")
    }
    res.render("campground/edit", { camp })
}))

router.put("/:id", isLoggedIn ,validateCamp, catchAsync(async (req, res) => {
    const { id } = req.params
    await campGroundModel.findByIdAndUpdate(id, req.body.campground, { new: true, runValidators: true })
    req.flash("success", "Campground updated successfully")
    res.redirect(`/campground/${id}`)
}))

router.delete("/:id",isLoggedIn , catchAsync(async (req, res) => {
    const { id } = req.params;
    await campGroundModel.findByIdAndDelete(id) //need to findByIdAndDelete to triger mongoose middleware
    req.flash("success", "Campground deleted successfully")
    res.redirect("/campground")
}))

module.exports = router;