import db from './server'
exports.handler = function(event, context, callback) {
    let body=JSON.parse(event.body);
    db.collection("sessions").deleteOne({sessionId:body["sid"]},function(err,result){
        if(err){
            callback(null,{
                statusCode:500,
                body:"Log-out error"
            });
        }
        else{
            callback(null,{
                statusCode:200,
                body:"Goodbye!"
            });
        }
        db.close();
    })
}