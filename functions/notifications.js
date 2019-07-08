var firebase = require("firebase");
exports.handler = function(event, context, callback) {
	context.callbackWaitsForEmptyEventLoop = false;  //<---Important

    var config = {
    apiKey: "AIzaSyBdK0boacor04eHtkpaOt-o21n-TISqBTw",
    authDomain: "jschat-official.firebaseapp.com",
    databaseURL: "https://jschat-official.firebaseio.com",
    projectId: "jschat-official",
    storageBucket: "jschat-official.appspot.com",
    messagingSenderId: "684850370153",
    appId: "1:684850370153:web:4086f7f88148148d"
    };

    if(firebase.apps.length == 0) {   // <---Important!!! In lambda, it will cause double initialization.
        firebase.initializeApp(config);
    }
	var channel = event.headers["channel"];
    callback(null, {
    statusCode: 200,
    body: channel
    });
}