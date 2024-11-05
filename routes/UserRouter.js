import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';
import { Register, login, logout, forgetPassword ,verifyOtp , resetPassword} from '../controllers/AuthController.js';
import { getAllUsers, getUserById, updateUser, deleteUser ,countUsers} from '../controllers/UserController.js';
import { validationResult } from 'express-validator';


const router = express.Router();

// Middleware for validation errors
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Signup route with file upload handling
router.post('/signup', multer, [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
], validateRequest, Register);

// Login route
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], validateRequest, login);

// Logout route
    router.delete('/logout', logout);

    router.route('/')
    .get(getAllUsers) // Retrieve all users

router.route('/countu')
.get(countUsers)

    router.route('/forgetpwd')
    .post(forgetPassword); // Assuming you want to allow OTP requests at this endpoint


    router.route('/otpverify')
    .post(verifyOtp)

    
    router.route('/resetpwd')
    .post(resetPassword)


router.route('/:id')
    .get(getUserById)
    .put(multer, [
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('first_name').optional().notEmpty().withMessage('First name is required'),
        body('last_name').optional().notEmpty().withMessage('Last name is required'),
        body('role').optional().notEmpty().withMessage('Role is required')
    ], validateRequest, updateUser)
    .delete(deleteUser);

// Exporting the router for use in other modules
export default router;
