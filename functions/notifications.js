import('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
import('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
import('https://www.gstatic.com/firebasejs/4.8.1/firebase-database.js');
exports.handler = function(event, context, callback) {
	var channel = event.headers["channel"];
    callback(null, {
    statusCode: 200,
    body: channel
    });
}