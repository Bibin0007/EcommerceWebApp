const fast2sms = require("fast-two-sms");
require('dotenv').config()


const sendMessage = function (mobile, res) {
    let randomOTP = Math.floor(Math.random() * 10000);
  var options = {
    authorization:'rwzBRzybTw8uVh3x9junOWHPhS5IaXiT4HDr0dPedRhEN8vegSvS8OnUdVvh',
      
    message: `your OTP verification code is ${randomOTP}`,
    numbers: [mobile],
  };
  //send this message
  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log("otp sent successfully");
    })  
    .catch((error) => {
      console.log(error);
    });
    return randomOTP
};



module.exports = {
    sendMessage
}


