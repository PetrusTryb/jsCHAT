exports.handler = function(event, context, callback) {
	var channel = event.headers["channel"];
	var sender = event.headers["sender"];
	var receivers = event.headers["receivers"];
    callback(null, {
    statusCode: 200,
    body: "Kanał: "+channel+"<br/>Nadawca: "+sender+"<br/>Odbiorcy: "+receivers,
    headers: {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"channel, sender, receivers"}
    });
}
