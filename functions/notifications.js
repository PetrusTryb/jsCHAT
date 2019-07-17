const fetch = require("node-fetch");
exports.handler = function(event, context, callback) {
	if(event.httpMethod!="OPTIONS"){
	var channelId = event.headers["channelId"];
	console.log(channelId);
	var channelName = event.headers["channelName"];
	console.log(channelName);
	var senderNick = event.headers["senderNick"];
	console.log(senderNick);
	var channelSpecificReceivers = fetch("https://jschat-official.firebaseio.com/channels/"+channelId+"/permissions.json").then(resp => resp.json())
    .then(resp => {
        console.log(resp);
    });
		/*var message = {
    "to": receiver,
    "notification": {
      "title": channel,
      "body": "Nowa wiadomość od: "+sender,
      "click_action":"https://jschat.netlify.com/"
      }
	var req = new XMLHttpRequest();
req.open('POST', 'https://fcm.googleapis.com/fcm/send', true);
req.setRequestHeader("content-type", "application/json");
req.setRequestHeader("authorization", "key="+process.env.fcm_server_key);
req.onreadystatechange = function (aEvt) {
  if (req.readyState == 4) {
     if(req.status == 200)
      console.info(req.responseText);
     else
      console.error(req.responseText);
  }
};
req.send(JSON.stringify());*/
		
    callback(null, {
    statusCode: 200,
    body: "OK",
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channelId, senderNick, channelName"}
    });
	}
	else{
	callback(null, {
    statusCode: 204,
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channelId, senderNick, channelName"}
    });
	}
}
