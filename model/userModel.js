const mongoose = require("mongoose");

const ProductModel = require("../model/productModel");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  image:{
    type: String,

  },
  cart: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          // required: true,
        },
        qty: {
          type: Number,
          // required: true,
        },
        price: {
          type: Number,
          // required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      // required: true,
    },
  },
  wishlist: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          // required: true,
        },
        price: {
          type: Number,
          // required: true,
        },
      },
    ],
  },
});


userSchema.methods.addToCart = async function (product) {
 
  let cart = this.cart;

  const isExisting = cart.item.findIndex((item) => {
    return (
      new String(item.productId).trim() == new String(product._id).trim()
    );
  });

  if (isExisting >= 0) {
    cart.item[isExisting].qty += 1;
  } else {
    cart.item.push({
      productId: product._id,
      qty: 1,
      price:product.price
    });
  }

  if (!cart.totalPrice) {
    cart.totalPrice = 0;
  }
  cart.totalPrice += product.price;
  return this.save();
}

userSchema.methods.removefromCart = async function (productId) {
  const cart = this.cart
  const isExisting = cart.item.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  )
  if (isExisting >= 0) {
    const prod = await ProductModel.findById(productId)
    cart.totalPrice -= prod.price * cart.item[isExisting].qty
    cart.item.splice(isExisting, 1)
    console.log('User in schema:', this)
    return this.save()
  }
}

userSchema.methods.addToWishlist = function (product) {
  const wishlist = this.wishlist;
  const isExisting = wishlist.item.findIndex((item) => {
    console.log(item.productId,'==',product._id)

    return new String(item.productId).trim() == new String(product._id).trim();
    
  });
  console.log(isExisting);
  if (isExisting >= 0) {
  } else {
    wishlist.item.push({
      productId: product._id,
      // price: product,

    });
  }
  return this.save();
};

userSchema.methods.removefromWishlist = async function (productId) {
  const wishlist = this.wishlist;
  const isExisting = wishlist.item.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  );
  if (isExisting >= 0) {
    wishlist.item.splice(isExisting, 1);
    return this.save();
  }
};

module.exports = mongoose.model("Users", userSchema);
