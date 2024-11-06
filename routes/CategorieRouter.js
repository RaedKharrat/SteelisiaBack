import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';
import { addOnce, updateOnce, getAll, getOneById, deleteOnce , countCategorie } from '../controllers/CategorieController.js';

const router = express.Router();

// Handling routes for the '/product' endpoint
router.route('/')
    .get(getAll)
    .post([body('name').notEmpty().withMessage('Name is required'),], addOnce);

router.route('/countc')
.get(countCategorie)

// Handling routes for the '/product/:id' endpoint
router.route('/:id')
    .get(getOneById)
    .put([body('name').notEmpty().withMessage('Name is required'),], updateOnce)
    .delete(deleteOnce);

// Exporting the router for use in other modules
export default router;
