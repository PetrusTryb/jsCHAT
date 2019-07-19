const fetch = require("node-fetch");
exports.handler = function(event, context, callback) {
	if(event.httpMethod!="OPTIONS"){
	var channelId = event.headers["channelid"];
	console.log(channelId);
	var channelName = event.headers["channelname"];
	console.log(channelName);
	var senderNick = event.headers["sendernick"];
	console.log(senderNick);
	fetch("https://jschat-official.firebaseio.com/channels/"+channelId+"/permissions.json").then(resp => resp.json())
    .then(resp => {
        Object.keys(resp).forEach(function(key){
    		console.log(key);
				fetch("https://jschat-official.firebaseio.com/tokens/"+key+".json").then(token => token.json())
    .then(token => {
		if(token!=null){
		var message = {
    "to": token,
			"collapse_key": "Nowe wiadomości: "+channelName,
			"priority": "high",
    "notification": {
      "title": channelName,
      "body": "Nowa wiadomość od: "+senderNick,
      "click_action":"https://jschat.netlify.com/",
			"icon": "https://jschat.netlify.com/logo_small.png"
      }}
		console.log(message);
		fetch("https://fcm.googleapis.com/fcm/send",{
        method: 'post',
        body:    JSON.stringify(message),
        headers: { 'Content-Type': 'application/json', 'authorization': 'key='+process.env.fcm_server_key},
    })
		}
		});
	});
});
		/*
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
