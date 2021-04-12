const express = require('express')  // Adding a express by runnig nmp install --save express
var MongoClient = require('mongodb').MongoClient;

const app = express()  // Creating a exprss 
const port = 3000     // Assining the port numnber
var url = "mongodb://localhost:27017/todo_db"; // database name is todo_db

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies


//Registration API 
app.post('/registerUser',function(req,response){
    console.log(req.body);
    var first_name_v = req.body.first_name;
    var last_name_v = req.body.last_name.trim();
    var email_v = req.body.email.trim();
    var password_v = req.body.password.trim();
    var confirm_password_v = req.body.confirm_password.trim();

    if(first_name_v==""||last_name_v==""||email_v==""||password_v==""||confirm_password_v==""){
        response.statusCode = 404;
        data = { result : "empty values : failed"};
        console.log("empty values failed");  
        return response.send(data)
    }
    else
    {
        MongoClient.connect(url, { useNewUrlParser: true }, async function (err, db) {
            if (err) {
              response.statusCode = 404;
              data = { result: "Connection failed" };
              console.log("Connection failed");
              response.send(data);
            } 
            else {
                var dbo =  db.db("todo_db"); 
                //checking for unique email 
                var une =  await dbo.collection("User").findOne({email:email_v});
                console.log("email unique",une)
                if(une){
                    data = {result:"email already exists"}
                    return response.send(data)
                }
                   //both passwords are not same 
                  if(password_v!==confirm_password_v)
                  {
                     data = {result:"password doesnt match"}
                     return response.send(data)
                             }
               
                
                var myobj = { firstName:first_name_v, lastName:last_name_v, email:email_v,password:password_v,confirmPassword:confirm_password_v};  
                dbo.collection("User").insertOne(myobj, function (err, res) {
                    if (err) {
                        response.statusCode = 404;
                        console.log("Insert failed");
                        data = { result: "insert failed" };
                        response.send(data);
                    } else {
                        console.log("1 document inserted");
                        db.close();
                        response.statusCode = 200;
                        data = { result: "inserted DONE" };
                        response.send(data);
                    }
                }); 
    }  
} )

    } 
});


app.get('/loginUser',async function (req,response){
   
    var email_v = req.body.email.trim();
    var password_v = req.body.password.trim();

    if(email_v==""||password_v==""){
        response.statusCode = 404;
        data = { result : "empty values : failed"};
        console.log("empty values failed");  
        return response.send(data)
    }

    else
    {
        MongoClient.connect(url, { useNewUrlParser: true }, async function (err, db) {
            if (err) {
              response.statusCode = 404;
              data = { result: "Connection failed" };
              console.log("Connection failed");
              response.send(data);
            } 
            else {
                var dbo =  db.db("todo_db");

    //finding if email exist in user collection
    const user = await dbo.collection("User").findOne({email:email_v});
    if(!user){
        //to be changed
        data = {result:"there is no account with this email"}
        return response.send(data);
    }
    //comparing user object password with the input password
    if(user.password == password_v){
        console.log("sucessfull login");
        //retreving tasks of the user after logging in successfully
     dbo.collection("tasks").find({email:email_v}).toArray(function(err, res){
         if(err){
           response.status(404).send({result:"something went wrong or no task found from this user "})
         }else{
             return response.status(200).send(res)
         }
     })
    }
    else{
        data ={result:"incorrect password"}
        return response.send(data)

    }

}

})

        }    
})


//TASKS API

//Task creation API
app.post("/create",async function(req,response){
    var todoTittle_v = req.body.todoTittle.trim();
    var todoDescription_v = req.body.todoDescription.trim();
    var email_v = req.body.email.trim();
    if(todoTittle_v==""||todoDescription_v==""){
        response.statusCode = 404;
        data = { result : "empty values : failed"};
        console.log("empty values failed");  
        return response.send(data)
    }
    else{
        MongoClient.connect(url, { useNewUrlParser: true }, async function (err, db) {
            if(err){
                response.statusCode = 404;
                data = { result: "Connection failed" };
                console.log("Connection failed");
                response.send(data);
            }
            else{
                var dbo =  db.db("todo_db");
                var taskObj = {todoTittle : todoTittle_v,todoDescription:todoDescription_v,email:email_v}
                dbo.collection("tasks").insertOne(taskObj,function(err,res){
                    if (err) { 
                        response.statusCode = 404;
                        console.log("Insert failed");
                        data = { result: "insert failed" };
                        response.send(data);
                    } else {
                        // console.log("task data inserted", res)
                        console.log("1 document inserted");
                        db.close();
                        response.statusCode = 200;   
                        response.send(res.ops[0]);
                    }
                })
            }

        })    

    }

})

app.patch('/update',async function(req,response){
  var todoListId_v = req.body.todoListId.trim();
  var todoTittle_v = req.body.todoTittle.trim();
  var todoDescription_v = req.body.todoDescription.trim();
  if(todoTittle_v==""||todoDescription_v==""){
    response.statusCode = 404;
    data = { result : "empty values : failed"};
    console.log("empty values failed");  
    return response.send(data)
}
else{
    MongoClient.connect(url, { useNewUrlParser: true }, async function (err, db) {

        if(err){
            response.statusCode = 404;
            data = { result: "Connection failed" };
            console.log("Connection failed");
            return response.send(data);
        }else{
            var dbo =  db.db("todo_db");
            const task = await dbo.collection("task").findOne({todoListId:todoListId_v});
            task[todoTittle]=todoTittle_v;
            task[todoDescription]=todoDescription_v;
            await task.save();
            return response.send(task);

        }
    })
} 
})

app.delete('/delete',async function(req,response){
    var email_v = req.body.email.trim();
    var todoListId_v = req.body.todoListId.trim();
    if(email_v==""||todoListId_v==""){
        response.statusCode = 404;
        data = { result : "empty values : failed"};
        console.log("empty values failed");  
        return response.send(data)
    }
    else{
        MongoClient.connect(url, { useNewUrlParser: true }, async function (err, db) {
            if(err){
                response.statusCode = 404;
                data = { result: "Connection failed" };
                console.log("Connection failed");
                return response.send(data);
            }
            else{
                var dbo =  db.db("todo_db");
                const deletedTask = await Task.findOneAndDelete({_id: todoListId_v});
                if(!deletedTask){
                    return response.status(404).send({"ERROR":"0 documents found by this id"});

                }
                else{
                    //if deleted sucessfully , then sending deleted task as response
                    return response.status(200).send(deletedTask)
                }

            }
        })

    }

    
})



    


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });