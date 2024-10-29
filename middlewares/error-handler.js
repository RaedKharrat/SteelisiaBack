// Middleware function for handling 404 (Not Found) errors
export function notFoundError(req, res, next) {
    // Creating a new Error object with a "Not Found" message
    const err = new Error("Not Found");

    // Setting the HTTP status code to 404
    res.status(404);

    // Passing the error to the next middleware
    next(err);
}

// Middleware function for handling general errors
export function errorHandler(err, req, res, next) {
    // Setting the HTTP status code to the provided status code or defaulting to 500 (Internal Server Error)
    res.status(res.statusCode || 500).json({ message: err.message });
}
