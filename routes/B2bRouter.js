// routes/b2bRoutes.js
import express from 'express';
import {
  createB2BRequest,
  getB2BRequests,
  getB2BRequestById,
  updateB2BRequest,
  deleteB2BRequest
} from '../controllers/B2bController.js';
import fileUpload from 'express-fileupload';

const router = express.Router();


router.use(fileUpload({
    useTempFiles: false,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
    responseOnLimit: 'File size limit exceeded',
  }));
  
router.post(
  '/',
  createB2BRequest
);

router.get('/', getB2BRequests);
router.get('/:id', getB2BRequestById);
router.put('/:id', updateB2BRequest);
router.delete('/:id', deleteB2BRequest);

export default router;