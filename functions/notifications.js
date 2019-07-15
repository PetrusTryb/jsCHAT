exports.handler = function(event, context, callback) {
	if(event.httpMethod=="POST"){
	var channel = event.headers["channel"];
	var sender = event.headers["sender"];
	var receivers = event.headers["receivers"];
	console.log(channel);
	console.log(sender);
	console.log(receivers);
	var splittedReceivers = receivers.split(";");
	splittedReceivers.forEach(function(receiver){
		console.log(receiver);
	});
    callback(null, {
    statusCode: 200,
    body: "Kanał: "+channel+"<br/>Nadawca: "+sender+"<br/>Odbiorcy: "+receivers
    });
	}
	else{
	callback(null, {
    statusCode: 200,
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, sender, receivers"}
    });
	}
}
