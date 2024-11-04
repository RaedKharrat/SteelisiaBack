import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { notFoundError, errorHandler } from "./middlewares/error-handler.js";
import ProductRoutes from "./routes/ProductRouter.js";
import CategorieRoutes from "./routes/CategorieRouter.js";
import UserRoutes from "./routes/UserRouter.js";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

// Creating an express app
const app = express();

// Setting the port number for the server (default to 9090 if not provided)
const PORT = process.env.PORT || 9090;

// Specifying the MongoDB database name
const databaseName = 'steelisiaDB';

// Enabling debug mode for mongoose
mongoose.set('debug', true);

// Connecting to the MongoDB database
mongoose.connect(`mongodb://127.0.0.1:27017/${databaseName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log(`Connected to ${databaseName}`);
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Serving static files (images) from the 'public/images' directory
app.use('/images', express.static('public/images'));

// Importing the routes
app.use('/product', ProductRoutes);
app.use('/categorie', CategorieRoutes);
app.use('/user', UserRoutes);

// Custom middleware for handling 404 errors
app.use(notFoundError);

// Custom middleware for handling general errors
app.use(errorHandler);

// Starting the server and listening on the specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
