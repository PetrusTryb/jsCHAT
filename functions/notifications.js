const admin = require("firebase-admin");
var serviceAccount = {   "type": "service_account",   "project_id": "jschat-official",   "private_key_id": "5a31ae1c1db80f49da671598d4460edbc7ff1835",   "private_key": process.env.admin_private_key.replace(/\\n/g, '\n'),   "client_email": "firebase-adminsdk-tin01@jschat-official.iam.gserviceaccount.com",   "client_id": "109068982179017847466",   "auth_uri": "https://accounts.google.com/o/oauth2/auth",   "token_uri": "https://oauth2.googleapis.com/token",   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-tin01%40jschat-official.iam.gserviceaccount.com" };
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jschat-official.firebaseio.com",
});
exports.handler = function(event, context, callback) {
if(event.httpMethod!="OPTIONS"){
	console.log(event.headers);
	var channelId = event.headers.channel;
	console.log(channelId);
	var channelName = event.headers.channelname;
	console.log(channelName);
	var sender = event.headers.sender;
	console.log(sender);
	return new Promise((resolve, reject) => {
		var messages = [];
		var database = admin.database();
		var channelUsers = database.ref("channels/"+channelId+"/permissions");
		channelUsers.on("value", function(snapshot) {
			var tokens = database.ref("tokens");
  			tokens.on("value",function(keys){
			if(!snapshot.hasChild("EVERYONE")){
  				snapshot.forEach(function(user){
  					if(keys.val()[user.key]!=undefined){
  					console.log("Sending message to: "+keys.val()[user.key]);
  					messages.push({
  						notification: {title: channelName, body: "Incoming message from: "+sender, click_action:"https://jschat.netlify.com/#messages!"+channelId},
  						token: keys.val()[user.key]
					});
  					}
  					else{
  						console.error("Device not found: "+user.key);
  					}
  				});
			}
			else{
				keys.forEach(function(key){
					console.log("Sending message to: "+key.val())
					messages.push({
  						notification: {title: channelName, body: "Incoming message from: "+sender},
  						token: key.val()
					});
				});
			}
			admin.messaging().sendAll(messages)
  .then((response) => {
    console.log(response.successCount + ' messages were sent successfully!');
    resolve({
    statusCode: 200,
    body: response.successCount.toString(),
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, channel_name, sender"}
    });
  });
			});
	});
	});
}
else{
	callback(null, {
    statusCode: 204,
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, channel_name, sender"}
    });
}
}