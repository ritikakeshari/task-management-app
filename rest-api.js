var express = require("express");
var cors = require("cors");

var mongoclient = require("mongodb").MongoClient;
var conString = "mongodb://127.0.0.1:27017";

var app = express();
app.use(cors());


app.use(express.urlencoded({extended:true}));
app.use(express.json());
// app.use(origin:"http://127.0.0.1:6600")

app.post("/register-user", (req, res)=>{
    var user ={
        UserId:req.body.UserId,
        UserName:req.body.UserName,
        Password:req.body.Password,
        Email:req.body.Email,
        Mobile:req.body.Mobile
    };
    mongoclient.connect(conString).then(clientObject =>{
        var database = clientObject.db("task-management");
        database.collection("users").insertOne(user).then(()=>{
            console.log("User Addded");
            res.end();
        });
    });
});

app.post("/add-task", (req, res)=>{
    var task ={
        AppointmentId: parseInt(req.body.AppointmentId),
        Title:req.body.Title,
        Description: req.body.Description,
        Date: new Date(req.body.Date),
        UserId:req.body.UserId
    };
    mongoclient.connect(conString).then(clientObject =>{
        var database = clientObject.db("task-management");
        database.collection("Appointments").insertOne(task).then(()=>{
            console.log("Task Addded");
            res.end();
        });
    });
});

app.put("/update-task/:id", (req, res)=>{
    var id = parseInt(req.params.id);
    var task ={
        AppointmentId: parseInt(req.body.AppointmentId),
        Title:req.body.Title,
        Description: req.body.Description,
        Date: new Date(req.body.Date),
        UserId:req.body.UserId
    };
    mongoclient.connect(conString).then(clientObject =>{
        var database = clientObject.db("task-management");
        database.collection("Appointments").updateOne({AppointmentId:id}, {$set:task}).then(()=>{
            console.log("Task Updated");
            res.end();
        });
    });
});

app.delete("/delete-task/:id", (req, res)=>{
    var id = parseInt(req.params.id);
    
    mongoclient.connect(conString).then(clientObject =>{
        var database = clientObject.db("task-management");
        database.collection("Appointments").deleteOne({AppointmentId:id}).then(()=>{
            console.log("Task Deleted");
            res.end();
        });
    });
});

app.get("/get-users", (req, res)=>{
    
    mongoclient.connect(conString).then(clientObject =>{
        var database = clientObject.db("task-management");
        database.collection("users").find({}).toArray().then(documents=>{
            
            res.send(documents);
            res.end();
        });
    });
});

app.get("/get-task/:userid", (req, res)=>{
    
    mongoclient.connect(conString).then(clientObject =>{
        var database = clientObject.db("task-management");
        database.collection("Appointments").find({UserId:req.params.userid}).toArray().then(documents=>{
            res.send(documents);
            res.end();
        });
    });
});

app.get("/get-appointment/:id", (req, res)=>{
    
    mongoclient.connect(conString).then(clientObject =>{
        var database = clientObject.db("task-management");
        database.collection("Appointments").find({AppointmentId:parseInt(req.params.id)}).toArray().then(documents=>{
            res.send(documents);
            res.end();
        });
    });
});

app.listen(6600);
console.log('Server Started : http://127.0.0.1:6600');