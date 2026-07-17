const mongoose = require("mongoose");

const order = new mongoose.Schema({
    user:{
        type: mongoose.Types.ObjectId,
        ref:"user",
    },
    book:{
        type:mongoose.Types.ObjectId,
        ref: "books",
    },
    quantity:{
        type: Number,
        default: 1,
        min: 1,
    },
    status:{
        type: String,
        default: "Order Placed",
        enum:["Order Placed", "Out for Delivery", "Delivered", "Cancelled"],
    },
  }, 
{timestamps:true}
);

module.exports = mongoose.model("order", order);     

