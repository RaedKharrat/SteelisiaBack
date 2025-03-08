import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { notFoundError, errorHandler } from "./middlewares/error-handler.js";
import ProductRoutes from "./routes/ProductRouter.js";
import CategorieRoutes from "./routes/CategorieRouter.js";
import UserRoutes from "./routes/UserRouter.js";
import CommandeRoutes from "./routes/CommandeRouter.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url'
import cloudinary from './middlewares/cloudinaryConfig.js';


dotenv.config();
// Load environment variables

// Creating an express app
const app = express();


console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Setting the port number for the server (default to 9090 if not provided)
const PORT = process.env.PORT || 9090;

// Specifying the MongoDB database name
const databaseName = 'steelisiaDB'; // Use env variable for flexibility

// Enabling debug mode for mongoose
mongoose.set("debug", true);

// MongoDB connection URL from environment variables for security
const mongoUri = `mongodb+srv://SteelisiaDB:cvkUlR8YrDgHLtxc@cluster0.mslhj.mongodb.net/${databaseName}?retryWrites=true&w=majority&appName=Cluster0`;

// Connecting to the MongoDB database
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connected to MongoDB database: ${databaseName}`);
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process on DB connection failure
  });

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://steelisia.tn", // Dynamically load frontend URL from env
    credentials: true, // Allow credentials (cookies) to be sent
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Serving static files (images) from the 'public/images' directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));



app.use("/images", express.static(path.join(__dirname, "public/images")));
// Importing the routes
app.use("/product", ProductRoutes);
app.use("/categorie", CategorieRoutes);
app.use("/user", UserRoutes);
app.use("/cmd", CommandeRoutes);

// Custom middleware for handling 404 errors
app.use(notFoundError);

// Custom middleware for handling general errors
app.use(errorHandler);

// Starting the server and listening on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


