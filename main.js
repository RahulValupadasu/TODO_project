const express = require('express')  // Adding a express by runnig nmp install --save express
var MongoClient = require('mongodb').MongoClient;

const app = express()  // Creating a exprss 
const port = 3000     // Assining the port numnber
var url = "mongodb://localhost:27017/mydb"; // database name is mydb

//Registration API 
app.post('/registration',fi=(req,res)=>{
    var first_name_v = req.body.first_name.trim();
    var last_name_v = req.body.last_name.trim();
    var email_v = req.body.email.trim();
    var password_v = req.body.password.trim();

    if(first_name_v==""||last_name_v==""||email_v==""||password_v==""){
        response.statusCode = 404;
        data = { result : "empty values : failed"};
        console.log("empty values failed");  
        response.send(data)
    }
    else{
        var dbo = db.db("mydb"); 
        var myobj = { firstName:first_name_v, lastName:last_name_v, email:email_v};  
        dbo.collection("User").insertOne(myobj, function(err, res) 
        {    
            if (err){
                response.statusCode = 404;
                console.log("Insert failed");    
                data = { result : "insert failed"};
                response.send(data)
            }else {  
                console.log("1 document inserted");    
                db.close(); 
                response.statusCode = 200;
                data = { result : "inserted DONE"} ;
                response.send(data)
            }
        }); 
    }


});

app.get('/login',async (req,res)=>{
    var email_v = req.body.email.trim();
    var password_v = req.body.password.trim();
    //finding if email exist in user collection
    const user = await dbo.collection("User").findOne({email_v});
    if(!user){
        //to be changed
        throw new Error("unable to login");
    }
    //comparing user object password with the input password
    if(user.password == password_v){
        console.log("sucessfull login");
    }
    else{
        throw new Error("unable to login");

    }


})