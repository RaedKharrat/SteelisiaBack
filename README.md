# Node.js Template

This repository serves as a template for building a Node.js application. It provides a structured foundation with essential features, frameworks, and tools.

## Features

- **Express.js Backend:** Utilizes Express.js for handling routes, requests, and responses.
- **MongoDB Integration:** Optional MongoDB integration for seamless data persistence.
- **RESTful API:** Follows RESTful principles for a scalable and maintainable architecture.
- **File Uploads with Multer:** Integrates Multer middleware for handling file uploads.
- **Error Handling Middleware:** Implements middleware functions for graceful error management.
- **Dockerized Deployment:** Includes Dockerfile for containerizing the Node.js application.
- **Docker Compose:** Provides Docker Compose configuration for orchestrating multiple containers, including the Node.js app and MongoDB.

## Usage

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/RaedKharrat/Template-Node-js.git
   cd template-node-js
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Set up environment variables as needed, e.g., MongoDB connection details.

4. **Run the Application:**
   ```bash
   npm run dev
   ```

   This command starts the development server using Nodemon for automatic reloading.

5. **Access the Application:**
   - Use [Postman](https://www.postman.com/) or any API testing tool to interact with the application.
   - Base URL: [http://localhost:9090](http://localhost:9090)

## Sample Endpoints:

**GET All Tests:**
URL: http://localhost:9090/tests
Method: GET

**GET Test by ID:**
URL: http://localhost:9090/tests/:id
Method: GET

**Create a New Test:**
URL: http://localhost:9090/tests
Method: POST
Body: JSON payload with test details

**Update a Test by ID:**
URL: http://localhost:9090/tests/:id
Method: PUT
Body: JSON payload with updated test details

**Delete a Test by ID:**
URL: http://localhost:9090/tests/:id
Method: DELETE

## Additional Commands

- **Start in Production Mode:**
  ```bash
  npm start
  ```

Wishing you the best of luck with your exam!
