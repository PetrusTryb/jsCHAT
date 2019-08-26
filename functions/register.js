const admin = require("firebase-admin");
var serviceAccount = {   "type": "service_account",   "project_id": "jschat-official",   "private_key_id": "5a31ae1c1db80f49da671598d4460edbc7ff1835",   "private_key": process.env.admin_private_key.replace(/\\n/g, '\n'),   "client_email": "firebase-adminsdk-tin01@jschat-official.iam.gserviceaccount.com",   "client_id": "109068982179017847466",   "auth_uri": "https://accounts.google.com/o/oauth2/auth",   "token_uri": "https://oauth2.googleapis.com/token",   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-tin01%40jschat-official.iam.gserviceaccount.com" };
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jschat-official.firebaseio.com",
});
exports.handler = function(event, context, callback) {
if(event.httpMethod!="OPTIONS"){
	var nick = event.headers["username"];
	var email = event.headers["email"];
	var password = event.headers["password"];
	console.log(`Creating account for: ${nick} with email: ${email} and password: ${password}`);
	admin.auth().createUser({
  email: email,
  password: password,
  displayName: nick,
  photoURL: 'https://jschat.netlify.com/logo_small.png',
  disabled: false
}).then(function(userRecord) {
  	console.log(userRecord);
  	var database = FirebaseDatabase.getInstance();
var userData = database.getReference("users/"+userRecord.uid);
var initialData = {
	"actualImage": "https://jschat.netlify.com/logo_small.png",
	"actualNick": nick,
	"lastOnline": new Date(),
	"points": 0
};
userData.set(initialData, function(error) {
  if (error) {
  	console.error(error);
     callback(null, {
    statusCode: 500,
    body: error.message
    });
  } else {
  	console.log(initialData);
     callback(null, {
    statusCode: 201,
    body: userRecord.uid
    });
  }
});
  })
  .catch(function(error) {
  	console.error(error);
    callback(null, {
    statusCode: 500,
    body: error.message
    });
  });
}
else{
	callback(null, {
    statusCode: 204,
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"username, email, password"}
    });
}
}