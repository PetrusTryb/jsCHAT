import db from './server'
exports.handler = function(event, context, callback) {
    /*try{
    db.collection("users").find().then(function(c){
        c.project({"username":true}).toArray(function (err, docs) {
            if(err){
                callback(null,{
                    statusCode:500,
                    body:"Database error"
                });
            }
            else{
                callback(null,{
                    statusCode:200,
                    body:JSON.stringify(docs)
                })
            }
        });
    })
}catch(e){*/
    db.collection("users").find().project({"username":true}).toArray(function(err,docs){
        if(err){
            callback(null,{
                statusCode:500,
                body:"Database error"
            });
        }
        else{
            callback(null,{
                statusCode:200,
                body:JSON.stringify(docs)
            })
        }
    });
}
