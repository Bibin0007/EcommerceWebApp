const express = require("express");
const route = express();
const adminController = require("../controller/adminController");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const config = require("../config/config");
const adminAuth = require("../middleware/adminAuth");
const nocache = require("nocache");
const multer = require("../util/multer");

route.use(express.json());
route.use(express.urlencoded({ extended: true }));

route.use(nocache());
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

route.get("/", adminAuth.isLogin, adminController.loadLogin);

route.get("/products", adminAuth.isLogout, adminController.loadProduct);

route.get("/addProducts", adminAuth.isLogout, adminController.loadAddProduct);

route.get("/users", adminAuth.isLogout, adminController.loadUsers);

route.get("/dashboard", adminAuth.isLogout, adminController.loadDashboard);

route.get("/logout", adminAuth.logout);

route.get("/editProduct", adminAuth.isLogout, adminController.loadEditProduct);

route.get("/block", adminController.blockUser);

route.get("/stock", adminAuth.isLogout, adminController.inStock);

route.get('/category', adminAuth.isLogout,adminController.loadCategory)

route.get('/loadBanner', adminAuth.isLogout,adminController.loadBanner)

route.get('/activeBanner',adminController.activeBanner)

route.get('/deleteBanner',adminController.deleteBanner)

route.get('/rest',adminController.activeB)

route.get('/active',adminController.activeB)

route.get('/loadOffer',adminController.loadOffer)

//order management

route.get('/order',adminAuth.isLogout, adminController.loadOrder)

route.get('/cancelOrder',adminAuth.isLogout, adminController.cancelOrder)

route.get('/confirmOrder',adminAuth.isLogout, adminController.confirmOrder)

route.get('/deliOrder',adminAuth.isLogout, adminController.deliveredOrder)

route.get('/returnOrder',adminAuth.isLogout, adminController.returnOrder)

route.get('/viewOrder', adminController.viewOrder)

route.get('/sales',adminAuth.isLogout,adminController.salesReport)

// route.get("/");

route.get('/category',adminController.loadCategory)

route.get('/deleteCategory',adminController.deleteCategory)
route.get('/offerStore',adminController.loadOffer)

route.get('/deleteOffer',adminController.deleteOffer)

//reports

route.get('/stockReport',adminController.stockReport)

// route.get('/salesReport',adminController.salesReport)

route.get('/loadfullSales',adminController.loadfullSales)

route.get('/download',adminController.adminDownload)

  
//post methods

route.post("/", adminController.verifyLogin);

route.post(
  "/addProducts",
  multer.upload.array('images'),
  adminController.addProduct,
  adminController.loadAddProduct
);

route.post("/update",multer.upload.array('images'), adminController.editProduct);

route.post('/addCategory',adminController.addCategory,adminController.loadCategory)

route.post('/addBanner',multer.upload.array("bannerImage"),adminController.addBanner)

route.post('/offerStore',adminController.offerStore)

//error page

route.get('*',(req,res)=>res.render('404'))





module.exports = route;
