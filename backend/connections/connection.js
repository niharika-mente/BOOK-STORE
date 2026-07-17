const mongoose = require("mongoose");   
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {   
        await mongoose.connect(`${process.env.URI}`);
        console.log('MongoDB connected successfully');
    }catch (error) {
        console.log(error);
    }    
};

connectDB();  