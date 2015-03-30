
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (auth.google.enabled){
    if (req.isAuthenticated()){
      res.redirect("/collections");
    }else{
      res.render("index")
    }
  }else{
    res.redirect("/collections");
  }
};
