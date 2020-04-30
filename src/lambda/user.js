import {connectToDB} from './server'
exports.handler = function(event, context, callback) {
    let body=JSON.parse(event.body);
    console.log("Validating session: "+body["sid"]);
    let db=connectToDB();
    db.collection("sessions").findOne({"sessionId":body["sid"]}, function(err, result) {
        if(err){
            console.error("Database error!");
        }
        if(result){
            console.log("Session found: "+body["sid"]);
            let userId=result.uid;
            db.collection("users").findOne({"_id":userId},function(err,userData) {
                if(userData){
                    console.log("Session is valid!");
                    db.close();
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(userData)
                    });
                }
                else{
                    console.log("Invalid session, sorry.");
                    db.close();
                    callback(null,{
                        statusCode:401,
                        body:"Invalid session"
                    });
                }
            })
        }
        else{
            console.log("Session not found: "+body["sid"]);
            db.close();
            callback(null, {
                statusCode: 403,
                body: "Not logged in"
              });
        }
    })
}