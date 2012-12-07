var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: "pollstr.app@gmail.com",
        pass: "pollstr s3cret p4ss"
    }
});

var Emailer = function() {
    console.log('new emailer');
}

Emailer.prototype.validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var bool = re.test(email);
    if (!bool) console.log("Email " + email + " failed to validate");
    return bool;
}

Emailer.prototype.sendMail = function(mailOptions) {
    console.log('prepare to send with ' + mailOptions.to);
    
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
    });
    
    
}

module.exports = new Emailer();