const userModel = require('../model/userModel')

const isLogin = (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.render("home");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async(req, res, next) => {
  try {
    if(req.session.user_id){
      const userData = await userModel.findById({_id:req.session.user_id})
      if (req.session.user_id && userData.isAvailable) {
        next();
      }
    }
   else {
      res.render("userLogin",{login:true,});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const logout = (req, res) => {
  try {
    req.session.user_id = null;
    res.redirect("/");
  } catch (error) {}
};

module.exports = {
  isLogin,
  isLogout,
  logout,
};
