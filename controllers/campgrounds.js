const campGroundModel = require("../model/campground");
const {cloudinary} = require("../cloudinary")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res) => {
    const campgrounds = await campGroundModel.find({})
    res.render("campground/index", { campgrounds })
}
module.exports.renderNewForm = async (req, res) => {
    res.render("campground/new")
}
module.exports.createCampground = async (req, res, next) => {
    console.log(req.body.campground.location)
    // if (!req.body.campground) throw new ExpressError("Not enough information", 404)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    req.files.map(file => ({url: file.path, filename: file.filename}))
    const camp = new campGroundModel(req.body.campground)
    camp.geometry = geoData.body.features[0].geometry
    camp.images = req.files.map(file => ({url: file.path, filename: file.filename}))
    camp.author = req.user._id; //req.user is from passport.session()   
    await camp.save()
    req.flash("success", "Campground created successfully")
    res.redirect(`/campground/${camp._id}`)
}
module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const camp = await campGroundModel.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        }
    }).populate("author")
    if (!camp){
        req.flash("error", "Campground not found")
        res.redirect("/campground")
    }
    res.render("campground/show", { camp })
}
module.exports.editCampground = async (req, res) => {
    const { id } = req.params
    const camp = await campGroundModel.findById(id)
    if (!camp){
        req.flash("error", "Campground not found")
        res.redirect("/campground")
    }
    res.render("campground/edit", { camp })
}
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    // console.log(req.body)
    const campground = await campGroundModel.findByIdAndUpdate(id, req.body.campground, { new: true, runValidators: true })
    const imgs = req.files.map(file => ({url: file.path, filename: file.filename}))
    campground.images.push(...imgs)
    await campground.save();
    if (req.body.deleteImages){
        for (let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash("success", "Campground updated successfully")
    res.redirect(`/campground/${campground._id}`)
}
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await campGroundModel.findByIdAndDelete(id) //need to findByIdAndDelete to triger mongoose middleware
    req.flash("success", "Campground deleted successfully")
    res.redirect("/campground")
}