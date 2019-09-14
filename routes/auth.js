var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route
router.get("/", function(req, res){
    res.render("landing");
});

//===============================================
//Auth Routes
//===============================================

//show register form
router.get("/register",function(req,res){
   res.render("register"); 
});

//create user
router.post("/register",function(req,res){
    //user.register - provided by local mongoose package
    //it gonna handle all the logic taking username and password(storing in hash) and storing in database
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err,user){
       if(err){
            console.log("");
            req.flash("error",err.message);
            return  res.render("register");
       } 
      passport.authenticate("local")(req,res,function(){
          req.flash("success","Welcome to HELP CAMP! "+ user.username);
          res.redirect("/campgrounds"); 
       });
    });
});

//show login form
router.get("/login",function(req, res) {
   
    res.render("login");
});

//create login\
//second argument - middleware, linked to passport.use(new LocalStrategy(User.authenticate()));
//takes req.body.pass/user and authenticate with the database.
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req,res){
    
});

//logout route
router.get("/logout",function(req, res) {
    req.logout();
    res.redirect("/campgrounds");
});


module.exports = router;