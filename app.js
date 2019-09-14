var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var flash = require("connect-flash");

// for _?method
var methodOverride = require("method-override");


var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");

var seedDb = require("./seeds");


//requring routes
var campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes    = require("./routes/comments"),
    authRoutes       = require("./routes/auth");
    
//seedDb();

//flash - connect
app.use(flash());

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "helping campers",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
//User.authenticate comes with passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//mongoose.connect("mongodb://localhost/help");
mongoose.connect("mongodb+srv://singh751:Ducati420@cluster0-m6gor.mongodb.net/test?retryWrites=true&w=majority");
   

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//linking css
app.use(express.static(__dirname + "/public"));

//provide to every route
//whatever we put in res.locals is what available in our tempelate
//this to know which user is on the page know
//we added to all the templates
app.use(function(req,res,next){
   res.locals.currentUser = req.user;
   //for flash
   //one for eroor and one for success
    //message connected to flash 
    //first arg - key
    //second arg - message.
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

//method override.
app.use(methodOverride("_method"));



//telling our app to use routes....
//"/campgrounds" to reduce the duplicacy in code
app.use("/",authRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The HelpCamp Server Has Started!");
});