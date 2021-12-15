const express = require('express');
const router = express.Router();
const User = require('../model/user');
const catchAsync = require("../utils/catchAsync");
const passport = require('passport');

router.get("/register", (req, res) => {
    res.render("users/register")
})

router.post('/register', catchAsync(async (req, res, next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) =>{
            if(err) return next(err);
            req.flash("success","welcome to Yelp Camp")
            res.redirect("/campground")
        });
    }catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
}))

router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post("/login", passport.authenticate('local', {failureFlash: true, failureRedirect: "/login"}), (req, res, next) => {
    req.flash("success", "welcome back")
    const redirectURL = req.session.returnTo || "/campground"
    delete req.session.returnTo
    res.redirect(redirectURL)
})

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "logged out")
    res.redirect("/campground")
})

module.exports = router;