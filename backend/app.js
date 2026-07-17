const express = require('express');
const app = express();
const cors = require("cors");

require("dotenv").config();
require("./connections/connection");
const User = require("./routes/user");
const Books = require("./routes/book");
const Favourite = require("./routes/favourite");
const Cart = require("./routes/cart");
const Order = require("./routes/order");

const allowedOrigins = [
    "https://book-store-5v8f.onrender.com", // Render backend (self, optional)
    "http://localhost:5173",                 // Local Vite dev server
    "https://bookverse-web.netlify.app",     // Netlify production frontend
];

// Add Netlify URL from env so it doesn't need to be hardcoded
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use(express.json());
 //routes
app.use("/api/v1",User);
app.use( "/api/v1",Books);
app.use("/api/v1",Favourite);
app.use("/api/v1",Cart);
app.use("/api/v1",Order);
//creating port
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});