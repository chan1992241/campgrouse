const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync")
const campGroundModel = require("../model/campground");
const Review = require("../model/reviews");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")


router.post("/",isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await campGroundModel.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success", "Review added successfully")
    res.redirect(`/campground/${campground._id}`)
}))

router.delete("/:reviewId",isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await campGroundModel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Review deleted successfully")
    res.redirect(`/campground/${id}`)
}))


module.exports = router;