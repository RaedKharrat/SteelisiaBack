import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';
import { addOnce, updateOnce, getAll, getOneById, deleteOnce } from '../controllers/ProductController.js';

const router = express.Router();

// Handling routes for the '/product' endpoint
router.route('/')
    .get(getAll)
    .post(
        multer,addOnce);

// Handling routes for the '/product/:id' endpoint
router.route('/:id')
    .get(getOneById)
    .put( multer,[body('name').notEmpty().withMessage('Name is required'),], updateOnce)
    .delete(deleteOnce);

// Exporting the router for use in other modules
export default router;
