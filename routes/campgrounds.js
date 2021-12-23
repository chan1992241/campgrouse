const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync")
const {isLoggedIn, validateCamp, isAuthor} = require("../middleware.js")
const campgrounds = require("../controllers/campgrounds");
const multer  = require('multer')
const {storage} = require("../cloudinary/index.js")
const upload = multer({ storage })

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post( isLoggedIn ,upload.array("image"),validateCamp, catchAsync(campgrounds.createCampground)) //multer will uploads to storage then only parse the immage to req body, so validateCamp need to be after multer
    // .post(upload.array("image"), (req, res) => { //upload.single("image") is a middleware from multer
    //     console.log(req.body, req.files)
    //     res.send("it worked")
    // })
    
router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn , isAuthor,upload.array("image"),validateCamp, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn , isAuthor, catchAsync(campgrounds.deleteCampground))

router.get("/:id/edit",isLoggedIn , isAuthor, catchAsync(campgrounds.editCampground))

module.exports = router;