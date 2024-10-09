const bcrypt = require("bcrypt");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const message = require('../config/sms');
const addressModel = require('../model/addressModel')
const orderModel = require('../model/orderModel')
const couponModel = require("../model/couponModel")
const bannerModel = require('../model/bannerModel')
const categoryModel = require("../model/categoryModel")
require('dotenv').config()

const Razorpay = require('razorpay');

let newUser;
let order
let jol=0;

//page rendering functions

loadHome = async (req, res) => {
  try {
    const session = req.session.user_id;
    const login = false;
    const banner = await bannerModel.findOne({is_active:1})
    productModel.find({}).exec((err, product) => {
      if (product) {
        res.render("home", { session, product, login,banners:banner });
      } else {
        res.render("home", { session, login,banners:banner });
      }
    })
  } catch (error) {
    
  }
};
const loadCart = async (req, res) => {
  try {
    console.log('1');
    userSession = req.session;
    console.log(userSession.user_id);
    if(userSession.user_id){
    // const login = false;
  
    const userData = await userModel.findById({ _id: userSession.user_id });
    console.log(userData);
    console.log(userSession.user_id);

    const completeUser = await userData.populate("cart.item.productId");
    console.log(completeUser.cart.totalPrice);

    res.render("cart", {
      userSession,
      user: userData,
      cartProducts: completeUser.cart,
      session: req.session.user_id,
    });
  }
   else{
     res.render('login')
   }
  } catch (error) {
    console.log(error);
  }
};;

loadContact = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("contact", { session, login });
};

loadProduct = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("products", { login, session });
};
 
const loadShop = async (req, res) => {
  try {
    // console.log("hi1");
    const session = req.session.user_id;
    const login = false;
    const categorydata = await categoryModel.find();
    const ID = req.query.id;
    const product = await productModel.find();
    let Catagory = req.query.catagory;
    console.log("catagory:" + Catagory);
    let catagoryFind = await productModel.find({ category: Catagory });
    console.log("catagoryFind:" + catagoryFind);

    if (Catagory == "all") {
      findCatagory = product;
    } else {
      findCatagory = catagoryFind;
    }

    if (!Catagory) {
      res.render("shop", {
        session,
        product,
        login,
        categorydata: categorydata,
      });
    } else {
      // res.json(findCatagory)
      res.render("shop", {
        session,
        product: findCatagory,
        login,
        categorydata: categorydata,
      });
    }
  } catch {
    console.log(error);
  }
};
loadLogin = (req, res) => {
  let login = true;
  res.render("userLogin", { login });
};

loadRegister = (req, res) => {
  const login = true;
  console.log('hai');
  res.render("register", { login });
};

loadProductDetails = async (req, res) => {
  const login = false;
  try {
    const session = req.session.user_id;

    console.log(req.query.id);

    const product = await productModel.findById({ _id: req.query.id });

    res.render("productDetails", { product, session, login });
  } catch (error) {
    console.log(error.message);
  }
}; 

// post methods

//register User

const registerUser = async (req, res, next) => {
  try {

    const userData = await userModel.findOne({email:req.body.email})
    const userData1 = await userModel.findOne({mobile:req.body.mobile})

    if (userData || userData1) {
        res.render('register',{message: 'This account already exists'})
    } else {
    
     newUser = {
      name: req.body.username,
      password: req.body.password,
      email: req.body.email,
      mobile: req.body.mobile,
      isAdmin: false,
    };
    
    next();
    }
   
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;

    const userData = await userModel.findOne({ email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password
      );

      if (passwordMatch) {
        if (userData.isAvailable) {
          req.session.user_id = userData._id;
          req.session.user_name = userData.name;
          res.redirect("/");
        } else {
          res.render("UserLogin", {
            message: "You are Blocked by the administrator",
          });
        }
      } else {
        res.render("UserLogin", { message: "Invalid password" });
      }
    } else {
      res.render("UserLogin", { message: "Account not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
 

const loadOtp =async (req, res) => {
    const userData = newUser
    console.log(userData);

    const mobile = userData.mobile

    newOTP = message.sendMessage(mobile,res)

    console.log(newOTP);

    res.render('otp',{newOTP, userData })

};

const verifyOtp =async (req, res, next) => {
 
  try {
	    const otp = req.body.newOtp
	    
        console.log(req.body.otp);
	
	    if (otp === req.body.otp) {
	        
	        const password = await bcrypt.hash(req.body.password,10)
            
            const user = new userModel({
                name: req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
                password:password,
                isAdmin:false,
                isAvailable:true
            })
            console.log(user);

            await user.save().then(()=>console.log('register successful'))
            if (user){
                res.render('userLogin')
            }else{
                res.render('otp',{message: 'invalid otp'})
            }

        } else{ 
            console.log('otp not match');
        }
} catch (error) {
	console.log(error.message);
}   

};



//cart management

const addToCart = async (req, res, next) => {
  try { 
    const productId = req.query.id;
    userSession = req.session;
    const userData = await userModel.findById({ _id: userSession.user_id });
    const productData = await productModel.findById({ _id: productId });
    console.log(productData);
      await userData.addToCart(productData);
          res.redirect("/shop");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const productId = req.query.id;
    userSession = req.session;

    const userData = await userModel.findById({ _id: userSession.user_id });
    await userData.removefromCart(productId);
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

//wishlist management

const addToWishlist = async (req, res) => {
  try {
    const productId = req.body.id;
    console.log(productId);
    userSession = req.session;
    const userData = await userModel.findById({ _id: userSession.user_id });
    const productData = await productModel.findById({ _id: productId });
    userData.addToWishlist(productData);
    res.redirect("/shop");
  } catch (error) {
    console.log(error.message);
  }
};

loadWishlist = async (req, res) => {
  try {
    userSession = req.session;
    const userData = await userModel.findById({ _id: userSession.user_id });
    const completeUser = await userData.populate("wishlist.item.productId");

    res.render("wishlist", {
      id: userSession.user_id,
      products: completeUser.wishlist.item,
      session: req.session.user_id,
      userImage: req.session.userImg,
    });
  } catch (error) {
    console.log(error.message);
  }
};;

const addCartDeleteWishlist = async (req, res) => {
  try {
    userSession = req.session;
    const productId = req.query.id;
    const userData = await userModel.findById({ _id: userSession.user_id });
    const productData = await productModel.findById({ _id: productId });
    const add = await userData.addToCart(productData);
    if (add) {
      await userData.removefromWishlist(productId);
    }
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
  } 
};

const deleteWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userData = await userModel.findById({ _id: userSession.user_id });
    await userData.removefromWishlist(productId);
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
  }
};
 
//checkout

const loadCheckout = async (req,res) => {

  const userId = req.session.user_id;

  console.log(userId);

  const user = await userModel.findById({_id: userId})

  const completeUser = await user.populate("cart.item.productId");

  const address = await addressModel.find({userId:userId})
  res.render('checkout',{add:address, totalPrice:completeUser.cart.totalPrice})

}

const addAddress =async (req,res) => {
  try {
      const userSession = req.session
      const addressData = addressModel({
        name:req.body.name,
        userId:userSession.user_id,
        address:req.body.address,
        city:req.body.city,
        state:req.body.state,
        zip:req.body.zip,
        mobile:req.body.mobile,
      })
  
      await addressData.save().then(()=>console.log('Address saved'))
        res.redirect('/checkout')
      
    
  } catch (error) {
    console.log(error.message);
  }
  }

const loadOrderDetail = async (req,res)=>{
  const userId = req.session.user_id
  await userModel.findById({_id:userId})

  const orderDetail = await orderModel.find( {userId: userId}).sort({createdAt:-1}).exec((err,data)=>{
    res.render("ordersummary",{session :req.session.user_id, order:data,userImage:req.session.userImg })
  })
}

const returnOrder = async (req, res) => {
  const orderData = await orderModel.findByIdAndUpdate(
    { _id: req.query.id },
    {
      $set: {
        status: "ReturnRequestReceived",
      },
    }
  );

  console.log(orderData);

  res.redirect("/orderDetails");
};
  
const loadOrderSummary = (req, res) => {

    res.render('ordersummary',{ session: req.session.user_id, userImage:req.session.userImg })
    
    };
    
let noCoupon;
let updatedTotal;

const applyCoupon = async (req, res) => {
  try {
    const { coupon } = req.body; //coupon code from input field using ajax
    const userSession = req.session;
    let message = "";
    let couponDiscount;
    console.log("coupon name", coupon);

    if (userSession.user_id) {
      const userData = await userModel.findById({ _id: userSession.user_id });

      const couponData = await couponModel.findOne({ code: coupon });

      updatedTotal = userData.cart.totalPrice;

      console.log(updatedTotal);

      if (couponData) {
        if (couponData.usedBy.includes(userSession.user_id)) {
          message = "coupon Already used";
          res.json({ updatedTotal, message });
        } else {
          req.session.couponName = couponData.code;
          req.session.couponDiscount = couponData.discount;
          req.session.maxLimit = couponData.maxLimit;
          console.log(req.session.couponName);
          console.log(req.session.couponDiscount);
          console.log(req.session.maxLimit);

          if (userData.cart.totalPrice < userSession.maxLimit) {
            updatedTotal =
              userData.cart.totalPrice -
              (userData.cart.totalPrice * userSession.couponDiscount) / 100;
            req.session.couponTotal = updatedTotal;
          } else {
            const percentage = parseInt(
              (userSession.couponDiscount / 100) * userSession.maxLimit
            );
            updatedTotal = userData.cart.totalPrice - percentage;
            console.log(updatedTotal);
            couponDiscount = parseInt(percentage);
            console.log("couponDiscount: " + couponDiscount);
            req.session.couponTotal = updatedTotal;
            console.log(userSession.couponDiscount);
          }
          console.log("total", req.session.couponTotal);

          res.json({ updatedTotal, message, couponDiscount });
        }
      } else {
        message = "The promotional code you entered is not valid.";
        res.json({ updatedTotal, message });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};


    const placeOrder =  async (req, res) => {
      try {
        userSession = req.session;
        const addressId = req.body.addressId;
        const address = await addressModel.findById({ _id: addressId });
        const userData = await userModel
          .findById({ _id: userSession.user_id })
          .populate("cart.item.productId");
      
        let  totalPrice = userData.cart.totalPrice -jol;
    
          console.log("address", address);
    
          
            order = await orderModel({
              userId: userSession.user_id,
              payment: req.body.payment,
              name: address.name,
              address: address.address,
              city: address.city,
              state: address.state,
              zip: address.zip,
              mobile: address.mobile,
              products: userData.cart,
              price :totalPrice
            });
            console.log(order);
    
            req.session.order_id = order._id;
    
          if (req.body.payment == "cod") {
            console.log("1");
            res.redirect("/orderSuccess");
          } else {
            console.log("2");
            var instance = new Razorpay({
              key_id :'rzp_test_m2QMJlI1oi6E6F',
              key_secret:"UqQbA4vzZOYIuHu5Bus3zr7i",
            });
            console.log("1");
            console.log(totalPrice);
            let razorpayOrder = await instance.orders.create({
             
              amount: totalPrice * 100,
              currency: "INR",
              receipt: order._id.toString(),
            });
            console.log();
            console.log("order Order created", razorpayOrder);
            res.render("razorpay", {
              userId: req.session.user_id,
              order_id: razorpayOrder.id,
              total: totalPrice,
              session: req.session,
              key_id  :process.env.RAZOR_ID,
              key_secret : process.env.RAZOR_secret,
              user: userData,
              order: order,
              orderId: order._id.toString(),
            });
            console.log("1");
          }
     
      } catch (error) {
        console.log(error);
      }
    };


    const loadOrderSuccess = async (req, res) => {
      try {
        if (userSession) {
          await order.save().then(() => {
              userModel
              .findByIdAndUpdate(
                { _id: req.session.user_id },
                {
                  $set: {
                    "cart.item": [],
                    "cart.totalPrice": "0",
                  },
                },
                { multi: true }
              )
              .then(() => {
                console.log("cart deleted");
    
                // Move the product quantity update code inside this block
                orderModel
                  .findById(order._id)
                  .populate("products.item.productId")
                  .then(async (order) => {
                    // decreasing quantity when buying products
                    for (const product of order.products.item) {
                      await productModel.findByIdAndUpdate(
                        product.productId._id,
                        { $inc: { quantity: -product.qty } },
                        { new: true }
                      );
                    }
                    // updating status if the product quantity is zero
    
                    for (const product of order.products.item) {
                      const products = await productModel.findById(
                        product.productId._id
                      );
    
                      if (products.quantity == 0) {
                        await productModel.findByIdAndUpdate(
                          product.productId._id,
                          {
                            $set: {
                              isAvailable: 0,
                            },
                          }
                        );
                      }
                    }
                  });
    
                  
              });
              
          });
          const productDetails = await productModel.find({ is_available: true});
      for (let i = 0; i < productDetails.length; i++) {
        for (let j = 0; j < order.products.item.length; j++) {
          if (
            productDetails[i]._id.equals(order.products.item[j].productId)
          ) {
            productDetails[i].sales += order.products.item[j].qty;
          }
        }
        productDetails[i].save();
      }

      res.render("orderSuccess", { session: req.session.user_id });
    }
  } catch (error) {}
};


const cancelOrder = async (req, res) => {
  await orderModel.findOneAndUpdate(
    { _id: req.query.id },
    {
      $set: {
        status: "Cancel",
      },
    }
  );
  console.log("cancelled order");
  res.redirect("/OrderDetails");
};

const viewOrders = async (req, res) => {


  try {
    userSession = req.session;

    const order = await orderModel.findOne({ _id: req.query.id });
    const userData = await userModel.findById({ _id: userSession.user_id });
    console.log(order.totalPrice);
    const completeData = await order.populate("products.item.productId");
    const completeUser = await userData.populate("cart.item.productId");

    res.render("orderlist", {
      order: completeData.products.item,
      user: userData,
      orders: order,
    });
  } catch {
    console.log(error);
  }
}


const loadForgetPassword = (req, res) => {
  res.render('forgetpassword',{login:true})
}

const forgetPassword = async (req, res) => {
  try {

    const mobile = req.body.mobile
    const user = await userModel.findOne({ mobile: mobile})
   if (user) {
     newOtp = message.sendMessage(mobile,res)
     console.log('Forget tp',newOtp);   
     res.render('forgetOtp',{newOtp,userData:user,login:true,})
   } else {
    res.render('forgetpassword',{message:"No user found"})
   }

    
  } catch (error) {

    console.log(error.message);
    
  }
}

const verifyForgetPassword = (req, res) => {
    
   try {

     const otp = req.body.otp
     const newOtp = req.body.newotp

     const id = req.body.id

     if (otp == newOtp) {

      res.render('changePassword',{id,login:true})
      
     } else {

      res.render('forgetOtp',{id:id,login:true,message:'Invalid OTP'})
      
     }
    
   } catch (error) {
    
   }
}


const changePassword = async (req, res) =>{

  const id = req.body.id;
  console.log(id);

  const currentPassword = req.body.currentPassword;

  console.log(currentPassword);

  const userData = await userModel.findById({_id:id})

  console.log(userData);

  const passwordMatch =await bcrypt.compare(req.body.currentPassword,userData.password)

  console.log(passwordMatch);

  if(passwordMatch){
 
    const newPass = await bcrypt.hash(req.body.password,1) 
    const user = await userModel.findByIdAndUpdate({_id:id}, {$set:{

      password:newPass


    }}).then(()=>{
      res.render('userLogin',{login:true,message:'Password Changed successfully'})
    })

  }else{
    console.log('not updated');
  }
 
}

const loadEditAddress = async (req, res) => {

  const addressId = req.query.id

  console.log(addressId);

  const address =await  addressModel.findById({_id: addressId}).exec((err,address)=>{
    console.log(address);

    res.render('editaddress', {address,addressId})
  })

 


}  


const editAddress = async (req, res) => {

  const addressId = req.body.id

  console.log(addressId);

   await addressModel.findByIdAndUpdate({_id: addressId},{$set:{
    name: req.body.name,
    address: req.body.address,
    city: req.body.city, 
    state: req.body.state,
    zip: req.body.zip,
    mobile: req.body.mobile,
  }}).then(()=>console.log('address updated'))

  res.redirect('/address')

}
 
const deleteAddress = async  (req,res) => {
   

  const  id = req.query.id

  await addressModel.findByIdAndDelete({_id: id}).then(()=>console.log('address deleted'))

  res.redirect('/address')



}
 
//user profile


const loadUserProfile = async (req, res) => {
  const session = req.session;

  userModel.findById({ _id: session.user_id }).exec((err, user) => {
    res.render("userProfile", { user, session: req.session.user_id });
    console.log(user.image);
  });
}; 

const loadEditUserProfile = async (req, res) => {
  const session = req.session;

   userModel.findById({ _id: session.user_id }).exec((err, user) => {
    res.render("editUserProfile", { user });
  });
};

const editUserProfile = async (req, res) => {   
  const id = req.session.user_id;
  await userModel
    .findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          dob: req.body.dob,
          image: req.file.filename,
        },
      }
    )
    .then((user) => {
      req.session.userImg = user.image;
      console.log(user.image);
      res.redirect("/editProfile");
    })
    .then(() => console.log("edited"));
};



const payment = async (req, res) => {
  userSession = req.session;
  const userData = await userModel.findById({ _id: userSession.user_id });
  const completeUser = await userData.populate("cart.item.productId");
  var instance = new Razorpay({
    key_id:process.env.PAYMENT_KEY,
    key_secret:process.env.PAYMENT_SECRET,
  });

  console.log(completeUser.cart.totalPrice);
  let myOrder = await instance.orders.create({
    amount: completeUser.cart.totalPrice * 100,
    currency: "INR",
    receipt: "receipt#1",
  });

  console.log(myOrder);

  if (res.status(201)) {
    res.json({ status: "success" });
  } else {
    res.json({ status: "success" });
  }
};

  
const loadAddress = async (req,res) => {

  const userId = req.session.user_id;

  const user = await userModel.findById({_id: userId})

 
  const address = await addressModel.find({userId:userId})
  res.render('address',{add:address,})

}

const updateCartItem = async (req, res) => {
  try {
    const id = req.query.id;
    // console.log(req.query);
    // console.log(id);
    userSession = req.session;
    const userdata = await userModel.findById({ _id: userSession.user_id });
    const foundproduct = userdata.cart.item.findIndex(
      (objInItems) => objInItems.productId == id
    );
    const qty = { a: parseInt(req.body.qty) };
    console.log("1");
    console.log(qty);
    userdata.cart.item[foundproduct].qty = qty.a;
    userdata.cart.totalprice = 0;
    const price = userdata.cart.item[foundproduct].price;
    console.log(price);
    const totalprice = userdata.cart.item.reduce((acc, curr) => {
      console.log(curr);
      return acc + curr.price * curr.qty;
    }, 0);
    console.log(userdata.cart.item);

    userdata.cart.totalPrice = totalprice;

    userdata.save();

    console.log(totalprice);
    res.json({ totalprice, price });
  } catch (error) {
    console.log(error.message);
  }
};

const orderFailed = async (req, res) => {

  try {
   // await order.status = "Attempted"
  
  
   //  console.log(order.status ,'orderStatus');
  
   await order.save().then(()=>{
      res.render('paymentFailed')
    })
  } catch (error) {
 
   console.log(error.message);
   
  }
 }

//________________coupon_________________

const addCouponValue = async (req, res) => {
  try {
    const totalPrice = req.body.totalValue;
  console.log("total12" + totalPrice);
     userdata = await userModel.findById({ _id: userSession.user_id });
     offerdata = await couponModel.findOne({ name: req.body.coupon });
     console.log('fghdj');
    if (offerdata) {
      console.log('p333');
      console.log(offerdata.expiryDate,Date.now());
      const date1 = new Date(offerdata.expiryDate);
      const date2 = new Date(Date.now());
      if (date1.getTime() > date2.getTime()) {
        console.log('p4444');
         if (offerdata.usedBy.includes(userSession.user_id)) {
            message = 'coupon already used'
            console.log(message);
         } else {
          console.log('eldf');
          console.log(userdata.cart.totalPrice,offerdata.maxAmount,offerdata.minAmount);
         if (userdata.cart.totalPrice <= offerdata.maxAmount && userdata.cart.totalPrice >= offerdata.minAmount) {
          console.log('COMMING');
          console.log('offerdata.name');
              await couponModel.updateOne({ name: offerdata.name }, { $push: { usedBy: userdata._id } });
                  console.log('kskdfthg');
                  fol =totalPrice
                disc = (offerdata.discount*totalPrice)/100;
                if(disc>offerdata.maxAmount){disc =offerdata.max}
                
                console.log(disc);
                jol = fol - disc
                res.send({ disc,state:1,fol,jol })
            }else{
              message = 'cannot apply'
              res.send({message,state:0 })
            }
         }  
      }else{
        message = 'coupon Expired'
        res.send({message,state:0 })
      } 
    }else{
      message = 'coupon not found'
      res.send({message,state:0 })
    }         
  } catch (error) {
    console.log(error);
  }
};


const searchProducts = async (req, res) => {
  const query = req.body.search;
  console.log(query);
  const products = await productModel.find({
    name: { $regex: query, $options: "i" },
  });
  console.log(products);
  res.json(products);
};
 
module.exports = {
  updateCartItem,
  loadProduct,
  loadContact,
  loadCart,
  loadHome,
  loadShop,
  loadLogin,
  loadRegister,
  registerUser,
  verifyLogin,
  loadProductDetails,
  loadOtp,
  verifyOtp,
  loadAddress,
  addToCart,
  deleteCart,
  addToWishlist,
  loadWishlist,
  addCartDeleteWishlist,
  deleteWishlist,
  loadCheckout,
  addAddress,
  loadOrderSuccess,
  loadOrderSummary,
  loadForgetPassword,
  forgetPassword,
  verifyForgetPassword,
  changePassword,
  loadEditAddress,
  editAddress,
  deleteAddress,
  loadUserProfile,
  loadEditUserProfile,
  editUserProfile,
  payment,
  placeOrder,
  cancelOrder,
  loadOrderDetail,
  viewOrders,
  returnOrder,
  orderFailed,
  applyCoupon,
  addCouponValue,
  searchProducts
};
