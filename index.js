const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');


const saltRounds = 10;
const app = express();
dotenv.config();
const port = process.env.PORT || 3000;

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.yuxbv.mongodb.net/registraionFormAllData`);

const registrationSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String
})

const Registration  = mongoose.model("Registration", registrationSchema);
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
  });

app.post("/register", async (req, res) =>{
    try{
        const {name , email, password} = req.body;

        const existingUser = await Registration.findOne({ email : email});
        if(!existingUser){
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if(err){
                    console.error("Error hashing password:", err);
                    res.redirect("/error");
                }else{
                    const registrationData = new Registration({
                        name,
                        email,
                        password : hash
                    });
                    await registrationData.save();
                    res.redirect("/success");
                }
            });
        }
        else {
            console.log("User already exist");
            res.redirect("/error");
        }
        
    }catch (error){
        console.log(error);
        res.redirect("/error");
    }
});

app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/public/success.html");
});

app.get("/error", (req, res) => {
    res.sendFile(__dirname + "/public/error.html");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
