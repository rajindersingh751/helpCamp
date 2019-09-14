var express = require("express");
var Campground = require("../models/campground");
var Comment = require("../models/comment");
//middleware file
var middleware = require("../middleware");

//we did mergerParams: true because of id was not able to find id of campground 
var router = express.Router({mergeParams: true});

//=======================
//comments
//=======================


//comments/new
router.get("/new", middleware.isLoggedIn, function(req,res){
    Campground.findById(req.params.id,function(err,camp){
        if(!err){
            res.render("comments/new",{camp: camp}); 
        }
    });
   
});

//comments create
router.post("/", middleware.isLoggedIn, function(req,res){
   //lookup campgrounds using id 
   Campground.findById(req.params.id,function(err,camp){
      if(!err){
          Comment.create(req.body.comment,function(err,comment){
              if(!err){
                  ///add username and id to comment
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  //save comment
                  comment.save();
                  camp.comments.push(comment);
                  camp.save();
                  req.flash("success","comment added successfuly")
                  res.redirect("/campgrounds/"+camp._id);
             }
          });
      } 
   });
   //create new comment
   //connect new comment to campground
   //redirect campground show paege
});

//comments edit
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
    Comment.findById(req.params.comment_id,function(err, comment) {
        if(!err){
            res.render("comments/edit",{campground_id: req.params.id,comment: comment});
        }
    });
  
});

//handling update
router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
   Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,comment){
     if(!err){
         req.flash("success","comment updated!");
         res.redirect("/campgrounds/"+req.params.id);
     }  
   });
});

//deleting comment
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
   
   Comment.findByIdAndRemove(req.params.comment_id,function(err,deleted){
       if(err){
           res.render("back");
       }else{
           req.flash("success","comment deleted successfuly")
           res.redirect("/campgrounds/"+req.params.id);
       }
   });
    
});


module.exports = router;