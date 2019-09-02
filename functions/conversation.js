const admin = require("firebase-admin");
var serviceAccount = {   "type": "service_account",   "project_id": "jschat-official",   "private_key_id": "5a31ae1c1db80f49da671598d4460edbc7ff1835",   "private_key": process.env.admin_private_key.replace(/\\n/g, '\n'),   "client_email": "firebase-adminsdk-tin01@jschat-official.iam.gserviceaccount.com",   "client_id": "109068982179017847466",   "auth_uri": "https://accounts.google.com/o/oauth2/auth",   "token_uri": "https://oauth2.googleapis.com/token",   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-tin01%40jschat-official.iam.gserviceaccount.com" };
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jschat-official.firebaseio.com",
});
exports.handler = function(event, context, callback) {
if(event.httpMethod=="DELETE"){
	var channelId = event.headers.channel;
	console.log(channelId);
	if(channelId==undefined){
		callback(null, {
    statusCode: 500,
    body: "Channel is undefined!",
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, token"}
    });
	}
	var token = event.headers.token;
	console.log(token);
	return new Promise((resolve, reject) => {
	admin.auth().verifyIdToken(token)
  .then(function(decodedToken) {
    var uid = decodedToken.uid;
   	console.log("Logged in as: "+uid);
   	var database = admin.database();
   	var permission = database.ref("channels/"+channelId+"/permissions/"+uid);
   	permission.on("value",function(snapshot){
   		if(snapshot.val()=="ADMIN"){
   			var toDelete = database.ref("channels/"+channelId);
   			toDelete.remove().then(function(){
   				console.log("Removed conversation #"+channelId);
   				resolve({
    statusCode: 200,
    body: "Removed successfully!",
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, channel_name, sender"}
    });
   			})
   		}
   		else{
   	console.error("No permissions to remove conversation!");
    resolve({
    statusCode: 403,
    body: "No permissions to remove conversation!",
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, channel_name, sender"}
    });
   		}
   	});
  }).catch(function(error) {
    console.error(error);
    resolve({
    statusCode: 403,
    body: error.message,
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, channel_name, sender"}
    });
  });
});
}
else{
	callback(null, {
    statusCode: 204,
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, token"}
    });
}
}