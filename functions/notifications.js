exports.handler = function(event, context, callback) {
	if(event.httpMethod!="OPTIONS"){
	var channel = event.headers["channel"];
	var sender = event.headers["sender"];
	var receivers = event.headers["receivers"];
	/*console.log(channel);
	console.log(sender);
	console.log(receivers);*/
	var splittedReceivers = receivers.split(";");
	splittedReceivers.forEach(function(receiver){
		//console.log(receiver);
		var message = {
    "to": receiver,
    "notification": {
      "title": channel,
      "body": "Nowa wiadomość od: "+sender,
      "click_action":"https://jschat.netlify.com/"
      }
}
		console.log(message);
		/*
	var req = new XMLHttpRequest();
req.open('POST', 'https://fcm.googleapis.com/fcm/send', true);
req.setRequestHeader("content-type", "application/json");
req.setRequestHeader("authorization", "key=AAAAn3RDVmk:APA91bHlQhNV6WkrRt2KHXPwkKoG9HMQYmPLQ8rldqpP37B3-BNmwzT_zC796V2fmpPOjlRU3vHIbvHhpNXBBc34mwLduvaCCDPcaJcJae2P24bqPJgqXAs6qmG6lstJ6mNK7JRXlNqt");
req.onreadystatechange = function (aEvt) {
  if (req.readyState == 4) {
     if(req.status == 200)
      console.info(req.responseText);
     else
      console.error(req.responseText);
  }
};
req.send(JSON.stringify());*/
	});
		
    callback(null, {
    statusCode: 200,
    body: "Kanał: "+channel+"<br/>Nadawca: "+sender+"<br/>Odbiorcy: "+receivers,
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, sender, receivers"}
    });
	}
	else{
	callback(null, {
    statusCode: 204,
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, sender, receivers"}
    });
	}
}
