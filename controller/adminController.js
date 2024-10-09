const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel");
const bannerModel = require("../model/bannerModel")
// const upload = require('../util/multer')
const exceljs = require("exceljs")

const multer = require("multer");
const path = require("path");
const orderModel = require("../model/orderModel");
const couponModel = require("../model/couponModel")

// const Storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/admin/assets/img/products");
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });
    
// const upload = multer({
//   storage: Storage,
// }).single("images");

const loadDashboard = async (req, res) => {
  try {

    adminSession = req.session
    if (adminSession) {
      const productData = await productModel.find()
      const userData = await userModel.find()
      // const adminData = await Admin.findOne()
      const categoryData = await categoryModel.find()
      const orders = await orderModel.find();

      const categoryArray = [];
      const orderCount = [];
      for(let key of categoryData){
        categoryArray.push(key.name)
        orderCount.push(0)
    }

    const completeorder = []
    const orderDate =[];
    const orderData =await orderModel.find()
    for(let key of orderData){
      const uppend = await key.populate('products.item.productId')
      orderDate.push(key.createdAt);
      completeorder.push(uppend)
  }
  // console.log(orderDate);
  const orderCountsByDate = {};
  orders.forEach(order => {
    const date = order.createdAt.toDateString();
    if (orderCountsByDate[date]) {
      orderCountsByDate[date]++;
    } else {
      orderCountsByDate[date] = 1;
    }
  });

const dates = Object.keys(orderCountsByDate);
const orderCounts = Object.values(orderCountsByDate);

  const productName =[];
  const salesCount = [];
  const productNames = await productModel.find();
  for(let key of productNames){
    productName.push(key.name);
    salesCount.push(key.sales)
  }
  for(let i=0;i<completeorder.length;i++){
    for(let j = 0;j<completeorder[i].products.item.length;j++){
       const cataData = completeorder[i].products.item[j].productId.category
       const isExisting = categoryArray.findIndex(category => {
        return category === cataData
       })
       orderCount[isExisting]++
}}

  const showCount = await orderModel.find().count()
  // console.log(showCount);
  const productCount = await productModel.count()
  const usersCount = await userModel.count()
  const totalCategory = await categoryModel.count({isAvailable:1})

// console.log(categoryArray);
// console.log(orderCount);


// console.log(orderCounts);

    res.render('dashboard', {
      users: userData,
      // admin,
      product: productData,
      category: categoryArray,
      count: orderCounts,
      pname:productName,
      pdate:dates,
      pcount:salesCount,
      showCount,
      productCount,
      usersCount,
      totalCategory
    });
      
  } else {
    res.redirect('/admin/')
  }
} catch (error) {
  // console.log(error.message)
  console.log(error.message);
}
} 

const loadAddProduct = (req, res) => {
  try {
    categoryModel.find().exec((err, category) => {
      res.render("addProducts", { category });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadUsers = async (req, res) => {
  try {
    const userData = await userModel.find({}).exec((err, user) => {
      if (user) {
        console.log(user);
        res.render("users", { user });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = (req, res) => {
  const logout = true;
  res.render("login", { logout });
};

const loadProduct = async (req, res) => {
  try {
    productModel.find({}).sort({_id:-1}).exec((err, product) => {
      if (product) {
        res.render("product", { product });
        console.log(product);
      }
    });
    await orderModel.find({}).countDocuments((err, count) =>{
      
      if (err) {
  
        console.log(err);
        
      } else {
        console.log(count,'countDocuments');
      }
  
  
      })
  } catch (error) {
    console.log(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const images = req.files
    const product = new productModel({
      name: req.body.product,
      category: req.body.category,
      price: req.body.price,
      image: images.map((x) => x.filename),
      description: req.body.description,
      quantity:req.body.qty,
      isAvailable: true,
    });

    await product.save().then(() => console.log("Product Saved"));

    next();
  } catch (error) {
    console.log(error.message);
  }
};

//post methods

async function verifyLogin(req, res, next) {
  try {
    const email = req.body.email;
    const userData = await userModel.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password
      );
      if (passwordMatch) {
        if (userData.isAdmin) {
          req.session.admin_id = userData._id;
          req.session.admin_name = userData.name;

          res.redirect("/admin");
        } else {
          res.render("login", { message: "you are not an admin" });
        }
      } else {
        res.render("login", { message: "password incorrect" });
      }
    } else {
      res.render("login", { message: "account not found" });
    }
  } catch (error) {
    console.log(error.message);
  } 
}

const editProduct = (req, res, next) => {
  try {
    const images = req.body.image

    if(images ==0){
    productModel
      .findByIdAndUpdate(
        { _id: req.body.ID },
        {
          $set: {
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            //image: images.map((x) => x),
            description: req.body.description,
            // image: req.body.image
          },
        }
      )
      .then(() => {
        res.redirect("/admin/products");
      });
    }
    else{
      productModel
      .findByIdAndUpdate(
        { _id: req.body.ID },
        {
          $set: {
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            image: images.map((x) => x.filename),
            description: req.body.description,
            // image: req.body.image
          },
        }
      )
      .then(() => {
        res.redirect("/admin/products");
      });
    }
    }
  
   catch (error) {
    console.log(error.message);
  }
};

const loadEditProduct = async(req, res) => {
  try {
   const category = await categoryModel.find({})

  const product = await productModel.findById({ _id: req.query.id })

  res.render('editProduct',{product,category})

  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  const userData = await userModel.findById({ _id: req.query.id });

  if (userData.isAvailable) {
    await userModel.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { isAvailable: false } }
    );
  } else {
    await userModel.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { isAvailable: true } }
    );
  }
  res.redirect("/admin/users");
};

const inStock = async (req, res) => {
  const product = await productModel.findById({ _id: req.query.id });

  if (product.isAvailable) {
    await productModel.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { isAvailable: false } }
    );
  } else {
    await productModel.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { isAvailable: true } }
    );
  }
  res.redirect("/admin/products");
};

const addCategory = async (req, res, next) => {
  const category = await categoryModel.findOne({ name: req.body.name });

  if (!category) {
    const category = new categoryModel({
      name: req.body.name,
    });
    await category.save().then(() => {
      console.log("category saved successfully");
    });
    next();
  } else {
    res.redirect("/admin/category");
  }
};
 
const loadCategory = (req, res, next) => {
  categoryModel.find({}).exec((err, category) => {
    if (category) {
      res.render("category", { category });
    } else {
      console.log("no category found");
    }
  });
};

const deleteCategory = async (req, res) => {
  await categoryModel.findByIdAndDelete({ _id: req.query.id });

  res.redirect("/admin/category");
};
// ====================order management================================
const loadOrder = async (req,res)=>{
  const order = await orderModel.find({}).sort({ createdAt: -1 });

  if (req.query.id) {
    id = req.query.id
    console.log(id);
    res.render("order", { order, id: id })
  } else {
    res.render('order',{order})
  }
}

const cancelOrder = async (req,res)=>{
  await orderModel.findOneAndUpdate(
    { _id: req.query.id },
    {
      $set: {
        status: "Cancel",
      },
    }
  );
  console.log("cancelled order");
  res.redirect("/admin/order");
}

const confirmOrder = async (req,res)=>{
  await orderModel.findByIdAndDelete(
    {_id:req.query.id},
    {$set:{status : "Confirm"}})
    res.redirect('/admin/order')
}

const deliveredOrder = async (req,res)=>{
  await orderModel.findByIdAndUpdate(
    {_id:req.query.id},
    {$set:{status : "Delivered"}})
    res.redirect('/admin/order')
}


const returnOrder = async(req,res)=>{
   await orderModel.findByIdAndUpdate(
    {_id:req.query.Id},
    {$set:{status:"Return"}}
   )
   res.redirect('/admin/order')
}

const viewOrder = async (req,res)=>{
  const order = await orderModel.findById({_id:req.query.Id})
  // console.log(order.totalPrice);
  const completeData = await order.populate("products.item.productId");

  res.render("orderList",{
  order : completeData.products.item,
  orders: order,
  session: req.session.user_id})
}

const stockReport = async(req,res)=>{
  try {
      const productdata = await productModel.find()
      res.render('stockReport',{
          product:productdata,
          admin:true
      })
  } catch (error) {
      console.log(error.message);  
  }
}


const salesReport = async(req,res)=>{
  try {
    console.log("1");
      const productdata = await productModel.find()
      console.log(productdata);
      
      res.render('sales',{products:productdata})

  } catch (error) {
      console.log(error.message);
  }
}

const monthlysales = async(req,res)=>{
  try {
      const month = req.body.month;
      // const endate = req.body.Endingdate;
      const startofmonth = new Date(month);
      const endofmonth = new Date(month);
      console.log(startofmonth);
      endofmonth.setMonth(endofmonth.getMonth()+1);
      const sales = await orderModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startofmonth,
                $lte: endofmonth,
              },
              status: 'Delivered', // Only count completed orders
            },
          },
          {
            $unwind: '$products.item',
          },
          {
            $group: {
              _id: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' },
                productId: '$products.item.productId',
              },
              quantity: { $sum: '$products.item.qty' },
              totalSales: { $sum: '$products.item.price' },
            },
          },
          {
            $lookup: {
              from: 'products',
              localField: '_id.productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $project: {
              _id: 0,
              month: '$_id.month',
              year: '$_id.year',
              productId: '$_id.productId',
              name: '$product.name',
              category: '$product.category',
              quantity: 1,
              totalSales: 1,
            },
          },
        ])
      // console.log(sales);
      res.render('monthlySales',{sales:sales})
      
  } catch (error) {       
      console.log(error.message);
  }
}


const datewiseReport = async(req,res)=>{
  try {
      const startdate = new Date(req.body.Startingdate)
      const enddate = new Date(req.body.Endingdate)

      // console.log(startdate);

      // const orders = await Order.find({createdAt:{$gte:startdate}})
      // console.log(orders);
      const sales = await orderModel.aggregate([
          {
              $match:{
                  createdAt:{
                      $gte: startdate,
                      $lt: enddate
                  },
                  status:'Delivered',
              },
          },
          {
              $unwind:'$products.item',
          },
          {
              $group:{
                  _id:'$products.item.productId',
                  totalSales:{ $sum: '$products.item.price'},
                  quantity:{ $sum: '$products.item.qty'}
              },
          },
          {
              $lookup:{
                  from:'products',
                  localField:'_id',
                  foreignField:'_id',
                  as:'product'
              },
          },
          {
              $unwind:'$product',
          },
          {
              $project:{
                  _id:0,
                  name:'$product.name',
                  category:'$product.category',
                  price:'$product.price',
                  quantity:'$quantity',
                  sales:'$totalSales'
              },
          },
      ])
      // console.log(sales);
      res.render('datewisereport',{sales:sales});
  } catch (error) {
      console.log(error.message);
  }
}



const loadfullSales = async(req,res)=>{
  try {
      res.render('ALLSales')
  } catch (error) {
      console.log(error.message)
  }
}



const adminDownload= async(req,res)=>{
  try {
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet("Stockreport")

      worksheet.columns = [
          { header:"Sl no.",key:"s_no" },
          { header:"Product",key:"name" },
          { header:"Category",key:"category" },
          { header:"Price",key:"price" },
          { header:"Quantity",key:"quantity" },
          { header:"Rating",key:"rating" },
          { header:"Sales",key:"sales" },
          { header:"isAvailable",key:"isAvailable" },
      ];

      let counter = 1;

      const productdata = await productModel.find()

      productdata.forEach((product)=>{
          product.s_no = counter;
          worksheet.addRow(product)
          counter++;
      })

      worksheet.getRow(1).eachCell((cell)=>{
          cell.font = {bold:true}
      });

      res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
      res.setHeader("Content-Disposition","attachment; filename=products.xlsx")   
      
      return workbook.xlsx.write(res).then(()=>{
          res.status(200)
      })

  } catch (error) {
      console.log(error.message);
  }
}

const loadBanner = async(req,res)=>{
  try {
    const bannerData = await bannerModel.find()
    res.render('banner',{banners:bannerData})
  } catch (error) {
    console.log(error);
  }
}

const addBanner = async(req,res)=>{
  const newBanner = req.body.banner
  const files = req.files
  const banner = new bannerModel({
    banner: newBanner,
    bannerImage:files.map((x)=>x.filename)
  })
  const bannerData = await banner.save()
  if(bannerData){
    res.redirect('/admin/loadBanner')
  }
}

const activeBanner = async(req,res)=>{
  const id = req.query.id
  await bannerModel.findOneAndUpdate({is_active:1},{$set:{is_active:0}})
  await bannerModel.findOneAndUpdate({id:id},{$set:{is_active:1}})
  res.redirect('/admin/loadBanner')
}

const deleteBanner = async(req,res)=>{
  try{
    const id = req.query.id;
    await bannerModel.deleteOne({_id:id});
    res.redirect('/admin/loadBanner')

  }
  catch(error){
    console.log(error.message);
    }
}




const offerStore = async (req, res) => {

  try {
    
    const offer =  new couponModel({

      name:req.body.name,
      type:req.body.type,
      discount:req.body.discount,
      minAmount:req.body.minAmount,
      maxAmount:req.body.maxAmount,
      expiryDate:req.body.expiryDate
      
    })
    await offer.save().then(()=>{
      console.log('saved');
      res.redirect('/admin/offerStore')
    })

  } catch (error) {

console.log(error.message);
    
  }


}

const loadOffer = async (req, res) => {

  try {
    const coupon = await couponModel.find({})
    
      res.render('offer',{offer:coupon})
    
  } catch (error) {
    console.log(error);
  }
  }

const deleteOffer = async(req,res)=>{
    try {
        const id = req.query.id;
        await couponModel.deleteOne({_id:id});
        res.redirect('/admin/offerStore')
    } catch (error) {
        console.log(error.message);
    }
  }

  const activeB = async (req, res) => {
    try {
      const bannerId = req.query.id;
      const banner = await bannerModel.findById(bannerId);
    
      // Deactivate other banners
      await bannerModel.updateMany({ _id: { $ne: bannerId } }, { $set: { is_active: false } });
      
      // Activate the clicked banner
      await bannerModel.findByIdAndUpdate(bannerId, { $set: { is_active: true } });
  
      res.redirect('/admin/loadBanner');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };
 

module.exports = {
  loadDashboard,
  loadProduct,
  loadAddProduct,
  loadUsers,
  loadLogin,
  verifyLogin,
  addProduct,
  editProduct,
  loadEditProduct,
  blockUser,
  inStock,
  loadCategory,
  addCategory,
  deleteCategory,
  loadOrder,
  cancelOrder,
  deliveredOrder,
  confirmOrder,
  returnOrder,
  viewOrder,
  salesReport,
  stockReport,
  monthlysales,
  datewiseReport,
  loadfullSales,
  adminDownload,
  loadBanner,
  addBanner,
  activeBanner,
  deleteBanner,
  offerStore,
  loadOffer,
  deleteOffer,
  activeB,
};
