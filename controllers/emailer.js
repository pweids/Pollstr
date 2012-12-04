var Emailer = function(content) {
    console.log('new emailer');
    this.content = content;
}

Emailer.prototype.validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

Emailer.prototype.sendMail = function(emails, content) {
    console.log('prepare to send to ' + emails);
    this.content = content || this.content;
    
    function sendIt(email) {
        console.log("Sending email to " + email);
    }
    
    if (typeof(emails) === 'string') {
        if (this.validateEmail(emails)) {
            sendIt(emails);
        };
    } else{
        for (var i = 0; i < emails.length; i++) {
            if (this.validateEmail(emails[i])) {
                sendIt(emails[i]);
            } else console.log(emails[i] + " did not validate");
        }
    }
}

module.exports = Emailer;