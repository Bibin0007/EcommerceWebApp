const express = require("express");
const route = express();
const path = require("path");
const hbs = require("express-handlebars");
const session = require("express-session");
const userMulter = require("../util/userMulter")


const cookieParser = require("cookie-parser");

//requiring user schema
const userSchema = require("../model/userModel");
const config = require("../config/config");

//requiring user controller
const userController = require("../controller/userController");
const userAuth = require("../middleware/userAuth");

//session
route.use(cookieParser());

route.use(
  session({
    secret: config.secretKey,
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: config.maxAge,
    },
  })
);

//get methods

route.get("/cart", userAuth.isLogout, userController.loadCart);

route.get("/contact", userController.loadContact);

route.get("/", userController.loadHome);

route.get("/product", userController.loadProduct);

route.get("/shop", userController.loadShop);

route.get("/login", userAuth.isLogin, userController.loadLogin);

route.get("/register", userController.loadRegister);

route.get("/logout", userAuth.isLogout, userAuth.logout);

route.get("/productDetails", userController.loadProductDetails);
 
route.get("/otp",userController.loadOtp)

route.get('/address', userAuth.isLogout,userController.loadAddress)
 
route.get('/addToCart',userAuth.isLogout,userController.addToCart)

route.get('/deleteCart',userController.deleteCart)
  
route.post('/addToWishlist',userController.addToWishlist)

route.get('/wishlist',userAuth.isLogout,userController.loadWishlist)

route.get('/deleteWishlist',userController.deleteWishlist)

route.get('/addCartDeleteWishlist',userController.addCartDeleteWishlist)

route.get('/ordersummary',userAuth.isLogout, userController.loadOrderSummary)

route.get('/orderSuccess',userAuth.isLogout, userController.loadOrderSuccess)

route.get('/paymentFailure',userAuth.isLogout,userController.orderFailed)

route.get('/forgetPassword', userController.loadForgetPassword)

route.get('/deleteAddress',userAuth.isLogout, userController.deleteAddress)

route.get('/OrderDetails',userAuth.isLogout, userController.loadOrderDetail)

route.get("/checkout",userAuth.isLogout,userController.loadCheckout)

route.get('/editProfile', userAuth.isLogout,userController.loadEditUserProfile)

route.get('/userProfile',userAuth.isLogout,userController.loadUserProfile)

route.get('/address',userAuth.isLogout,userController.loadAddress)

route.get('/viewOrder',userAuth.isLogout,userController.viewOrders)

route.get('/returnOrder',userAuth.isLogout,userController.returnOrder)




//post methods

route.post("/register", userController.registerUser, userController.loadOtp);

route.post("/login", userController.verifyLogin);
  
route.post('/otp',userController.verifyOtp)

route.post('/forgetPassword', userController.forgetPassword)

route.post('/verifyForgetOtp',userController.verifyForgetPassword)

route.post('/changePassword', userController.changePassword)

route.post ("/addAddress", userController.addAddress)

route.get('/editAddress', userController.loadEditAddress)

route.post('/editAddress', userAuth.isLogout,userController.editAddress)

route.post('/editUser',userAuth.isLogout,userMulter.upload,userController.editUserProfile)

route.post('/razorpay',userController.payment)

route.post('/placeOrder',userController.placeOrder)

route.post('/updateCartItem',userController.updateCartItem)

route.post('/addCoupen', userController.addCouponValue)


route.post('/products/search', userController.searchProducts)


module.exports = route;
