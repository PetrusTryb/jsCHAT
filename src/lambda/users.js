import {connectToDB} from './server'
exports.handler = function(event, context, callback) {    
    let db=connectToDB();
    try{
    db.collection("users").find().then(function(c){
        c.project({"username":true}).toArray(function (err, docs) {
            db.close();
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
}catch(e){
    console.warn("Alternative method!")
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
        db.close();
    });
}
}