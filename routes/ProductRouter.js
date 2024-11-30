import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';
import { addOnce, updateOnce, getAll, getOneById, deleteOnce ,countProducts, getNewestProducts, applyDiscount,getRandomProducts,getProductsByCategory,uploadPDF , downloadLatestPDF} from '../controllers/ProductController.js';

const router = express.Router();

// Handling routes for the '/product' endpoint
router.route('/newest')
    .get(getNewestProducts)
    router.route('/randomproduct')
    .get(getRandomProducts)
    router.route('/productsbycategorie/:categorieId')
    .get(getProductsByCategory)
router.route('/')
    .get(getAll)
    .post(
        multer,addOnce);
router.route('/countp')
.get(countProducts)

router.post('/upload-pdf', uploadPDF);
router.get('/download-pdf', downloadLatestPDF);

// Handling routes for the '/product/:id' endpoint
router.route('/:id')
    .get(getOneById)
    .put( multer,[body('name').notEmpty().withMessage('Name is required'),], updateOnce)
    .delete(deleteOnce);

    
    router.route('/discount/:id')
    .post(applyDiscount) // Retrieve all users
// Exporting the router for use in other modules
export default router;
