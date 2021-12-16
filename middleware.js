const { campgroundSchema, reviewSchema} = require("./schemas.js")
const ExpressError = require("./utils/ExpressError.js")
const campGroundModel = require("./model/campground")
const reviewModel = require("./model/reviews")

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()){ //isAuthenticated() is from passport
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You need to signed in")
        return res.redirect("/login")
    }
    next();
}

module.exports.validateCamp = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await campGroundModel.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash("error", "You do not have permission to do this")
        return res.redirect(`/campground/${id}`)
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const {reviewId, id} = req.params;
    const review = await reviewModel.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash("error", "You do not have permission to do this")
        return res.redirect(`/campground/${id}`)
    }
    next();
}