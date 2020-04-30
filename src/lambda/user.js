import db from './server'
exports.handler = function(event, context, callback) {
    let body=JSON.parse(event.body);
    console.log(body["sid"])
    db.collection("sessions").findOne({"sessionId":body["sid"]}, function(err, result) {
        if(result){
            let userId=result.uid;
            db.collection("users").findOne({"_id":userId},function(err,userData) {
                if(userData){
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(userData)
                    });
                }
                else{
                    callback(null,{
                        statusCode:401,
                        body:"Invalid session"
                    });
                }
                db.close();
            })
        }
        else{
            callback(null, {
                statusCode: 403,
                body: "Not logged in"
              });
            db.close();
        }
    })
}