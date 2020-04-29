import db from './server'
exports.handler = function(event, context, callback) {
    let body=JSON.parse(event.body);
    let sid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    var md5 = require('md5');
        db.collection("users").findOne({"email":body["email"],"pass":md5(process.env.DB_salt+body["pass"])}, function(err, result) {
          if(result){
            console.log("Creating session for "+body["email"]);
            let session={
                "sessionId":sid,
                "uid":result._id,
                "loginTime":String(Date.now())
            }
            db.collection("sessions").insertOne(session, function(err, res) {
                if (err){
                    console.error(err)
                    callback(null, {
                        statusCode: 500,
                        body:String(err.code)
                        });
                }
                else{
                callback(null, {
                statusCode: 200,
                body: sid
                });
                }
                db.close();
              });
            }
          else{
            console.error("Invalid password provided for "+body["email"]);
            callback(null, {
              statusCode: 401,
              body: "Wrong email or password"
            });
            db.close();
          }
        });
}