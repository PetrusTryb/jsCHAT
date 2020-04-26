import db from './server'
exports.handler = function(event, context, callback) {
    
    let body=JSON.parse(event.body);
    var md5 = require('md5');
    let userData={
        "username":body["nick"],
        "email":body["email"],
        "pass":md5(process.env.DB_salt+body["pass"]),
        "joinedAt":String(Date.now())
};
db.collection("users").insertOne(userData, function(err, res) {
    if (err){
        console.error(err)
        callback(null, {
            statusCode: 500,
            body:String(err.code)
            });
    }
    else{
        console.log(userData);
    callback(null, {
    statusCode: 200,
    body: String(userData._id)
    });
    }
  });
}