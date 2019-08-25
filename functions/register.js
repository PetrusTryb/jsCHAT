const admin = require("firebase-admin");
var serviceAccount = process.env.admin_config;

admin.initializeApp(serviceAccount);
exports.handler = function(event, context, callback) {
if(event.httpMethod!="OPTIONS"){
	var nick = event.headers["username"];
	var email = event.headers["email"];
	var password = event.headers["password"];
}
else{
	callback(null, {
    statusCode: 204,
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"username, email, password"}
    });
}
}