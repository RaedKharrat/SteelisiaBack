// controllers/b2bController.js
import B2B from '../models/B2B.js';
import Product from '../models/Product.js';
import cloudinary from '../middlewares/cloudinaryConfig.js';
import { v4 as uuidv4 } from 'uuid';

// Modified uploadToCloudinary function
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.data.toString('base64')}`,
      {
        folder: 'b2b_docs',
        public_id: uuidv4(),
        resource_type: 'auto',
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      }
    );
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload error: ${error.message}`);
  }
};

// Create B2B Request
export const createB2BRequest = async (req, res) => {
  try {
    const { product, quantity, ...otherFields } = req.body;
    const files = req.files;

    // Validate required files
    if (!files?.patenteFile || !files?.registreFile || !files?.cinFile) {
      return res.status(400).json({ message: 'All documents are required' });
    }

    // Validate product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(400).json({ message: 'Invalid product selected' });
    }

    // Upload all files to Cloudinary
    const [patenteFile, registreFile, cinFile] = await Promise.all([
      uploadToCloudinary(files.patenteFile),
      uploadToCloudinary(files.registreFile),
      uploadToCloudinary(files.cinFile)
    ]);

    // Create new B2B request
    const newRequest = new B2B({
      product,
      quantity: Number(quantity),
      patenteFile,
      registreFile,
      cinFile,
      ...otherFields
    });

    await newRequest.save();
    
    // Populate product details in response
    const populatedRequest = await B2B.findById(newRequest._id)
      .populate('product', 'name prix qnt');

    res.status(201).json(populatedRequest);

  } catch (error) {
    res.status(400).json({
      message: error.message,
      ...(error.errors && { details: error.errors })
    });
  }
};

// Update B2B Request (partial update)
export const updateB2BRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const files = req.files;

    const existingRequest = await B2B.findById(id);
    if (!existingRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Handle product update validation
    if (updates.product) {
      const productExists = await Product.findById(updates.product);
      if (!productExists) {
        return res.status(400).json({ message: 'Invalid product' });
      }
    }

    // File update handling
    const fileUpdates = {};
    const filesToDelete = [];

    if (files) {
      await Promise.all(
        Object.keys(files).map(async (field) => {
          const newFile = files[field];
          const oldFileUrl = existingRequest[field];
          
          // Upload new file
          const newUrl = await uploadToCloudinary(newFile);
          fileUpdates[field] = newUrl;

          // Track old file for deletion
          const publicId = oldFileUrl.split('/').pop().split('.')[0];
          filesToDelete.push(publicId);
        })
      );
    }

    // Combine updates
    const updatedData = {
      ...updates,
      ...fileUpdates,
      ...(updates.quantity && { quantity: Number(updates.quantity) })
    };

    // Perform update
    const updatedRequest = await B2B.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    ).populate('product', 'name prix qnt');

    // Cleanup old files
    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map(publicId => 
          cloudinary.uploader.destroy(`b2b_docs/${publicId}`)
        )
      );
    }

    res.json(updatedRequest);

  } catch (error) {
    res.status(400).json({
      message: error.message,
      ...(error.errors && { details: error.errors })
    });
  }
};

// Keep other controller methods (getB2BRequests, getB2BRequestById, deleteB2BRequest) the same
// Get All B2B Requests
export const getB2BRequests = async (req, res) => {
  try {
    const requests = await B2B.find()
      .populate('product', 'name prix qnt images')
      .sort({ createdAt: -1 });
      
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

// Get Single B2B Request
export const getB2BRequestById = async (req, res) => {
  try {
    const request = await B2B.findById(req.params.id)
      .populate('product', 'name description prix qnt images');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request' });
  }
};

// Update B2B Request


// Delete B2B Request
export const deleteB2BRequest = async (req, res) => {
  try {
    const request = await B2B.findByIdAndDelete(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Extract public IDs from Cloudinary URLs
    const filesToDelete = [
      request.patenteFile,
      request.registreFile,
      request.cinFile
    ].map(url => {
      const parts = url.split('/');
      return `b2b_docs/${parts[parts.length - 1].split('.')[0]}`;
    });

    // Delete files from Cloudinary
    await Promise.all(
      filesToDelete.map(publicId => 
        cloudinary.uploader.destroy(publicId)
    ));

    res.json({ message: 'Request deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting request' });
  }
};