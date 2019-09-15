var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
//middlewarefile
var middleware = require("../middleware");

//code for image upload
var multer = require("multer");
//making custom name of file uploaded 
var storage = multer.diskStorage({
   filname: function(req,file,callback){
       callback(null,Date.now() + file.originalname);
   } 
});

var imageFilter = function(req,file,cb){
    //accept imagefile only
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|)$/i)){
        return cb(new Error("only image files allowed!"), false);
    }
    cb(null,true);
};

var upload = multer({storage: storage, fileFilter: imageFilter})

var cloudinary = require("cloudinary");

cloudinary.config({
   cloud_name: "densxvnf8",
   api_key: 377689799435959,
   api_secret: "AuzlvXeO9qcUYkno_6NNFjSRhKY"
});

//INDEX(ROUTE) - SHOW ALL CAMPGROUNDS
router.get("/", function(req, res){
    //get all the campgrounds from db.
   Campground.find({},function(err, campgrounds){
      if(err){
          req.flash("error","something went wrong!");
      } 
      else{
           res.render("campgrounds/campgrounds",{campgrounds:campgrounds, currentUser: req.user});
      }
   });
});

//CREATE(ROUTE) - ADD NEW CAMPS
router.post("/",middleware.isLoggedIn,upload.single("image"), function(req, res){
    //req.file comming from multer
    cloudinary.uploader.upload(req.file.path, function(result){
        // get data from form and add to campgrounds array
        var name = req.body.name;
        var price = req.body.price;
        //add cloudinary url to campground object under image property
        var image = result.secure_url;
        var desc = req.body.description;
        //add author to campground
        var author = {
          id: req.user._id,
          username: req.user.username
        };
        var newCampground = {name: name, price: price,image: image, description: desc, author: author};
        Campground.create(newCampground,function(err,newCampground){
            if(err){
                req.flash("error","something went wrong!");
            }
            else{
                 //redirect back to campgrounds page
                 req.flash("succes","campground added successfuly");
                 res.redirect("/campgrounds");
            }
        });
    });
  
});

//NEW(ROUTE) - FORM TO CREATE NEW CAMPS 
router.get("/new",middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

//SHOW  - show more info about campgrounds
router.get("/:id",function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,camp){
        if(!err){     
            res.render("campgrounds/show",{campground: camp}); 
        }
        else
        {
           req.flash("error","something went wrong");
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req, res) {
    
        Campground.findById(req.params.id,function(err,campground){
            if(!err){
                  res.render("campgrounds/edit",{campground: campground});
                }
          
        });
   
});

//edit handler
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
    
   //find and update the correct campground
   Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,camp){
      if(!err){
          req.flash("success","campground updated");
          res.redirect("/campgrounds/" +camp._id);
      } 
   });
});


//DESTROY - ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership,function(req, res) {
   
   Campground.findByIdAndRemove(req.params.id,function(){
        req.flash("succes","campground deleted successfuly!");
        res.redirect("/campgrounds");
       
   });
    
});


module.exports = router;
