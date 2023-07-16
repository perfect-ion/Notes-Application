const mongoose = require('mongoose')
const mongoURI = "mongodb+srv://root:root@cluster0.uwt9htm.mongodb.net/test";

mongoose.set("strictQuery", false);

const connectToMongo = () => {
    mongoose.connect(mongoURI,()=>{
        console.log("Connected to Mongo Successfully")
    })
}

module.exports = connectToMongo;