const campGroundModel = require("../model/campground");
const Review = require("../model/reviews");

module.exports.createReview = async (req, res) => {
    const campground = await campGroundModel.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success", "Review added successfully")
    res.redirect(`/campground/${campground._id}`)
}
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await campGroundModel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Review deleted successfully")
    res.redirect(`/campground/${id}`)
}