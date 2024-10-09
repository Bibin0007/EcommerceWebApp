const mongoose = require('mongoose')
const Product = require('./productModel')
const User = require('./userModel')

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payment: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  Total:{

    type:Number,

  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now()
  },
  products: {
    item: [{
      productId: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
        // required:true
      },
      qty: {
        type: Number
        // required:true
      },
      price: {
        type: Number
      }
    }],
    totalPrice: {
      type: Number,
      default: 0
    }
  },

  status: {
    type: String,
    default: "Confirm"
  },
  price:{
    type : Number,
    default :0,
  }
  , 
  productReturned: [{
    type: Number
  }],
  

})


module.exports = mongoose.model('Orders', orderSchema)
