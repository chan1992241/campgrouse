module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()){ //isAuthenticated() is from passport
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You need to signed in")
        return res.redirect("/login")
    }
    next();
}

