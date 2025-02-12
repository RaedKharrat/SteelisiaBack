import { validationResult } from 'express-validator';
import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import simpleGit from 'simple-git'; // Import simple-git

const git = simpleGit(); // Initialize simple-git

// Configure multer for PDF file uploads
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/pdf';
        // Ensure the directory exists
        if (!fs.existsSync(uploadPath))  {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath); // Save to uploads/pdf folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Add timestamp to avoid filename conflicts
    },
});

// Filter for PDFs only
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// Multer middleware for handling PDF uploads
const upload = multer({ storage: pdfStorage, fileFilter: pdfFilter });

// Controller function to upload a PDF
export const uploadPDF = (req, res) => {
    upload.single('pdf')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const pdfDirectory = path.resolve('uploads/pdf');
        
        // Check if there is already an existing PDF file
        fs.readdir(pdfDirectory, (err, files) => {
            if (err) {
                return res.status(500).json({ error: 'Error reading the directory' });
            }

            // Filter PDF files and delete the previous one if exists
            const existingPDFs = files.filter(file => file.endsWith('.pdf'));

            if (existingPDFs.length > 0) {
                const previousFilePath = path.join(pdfDirectory, existingPDFs[0]);
                
                // Delete the previous PDF
                fs.unlink(previousFilePath, (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error deleting the previous file' });
                    }
                    
                    // Respond with the new file upload success
                    res.status(200).json({
                        message: 'PDF uploaded and previous PDF deleted successfully',
                        filePath: req.file.path,
                    });
                });
            } else {
                // If no existing file, just respond with the new file upload
                res.status(200).json({
                    message: 'PDF uploaded successfully',
                    filePath: req.file.path,
                });
            }
        });
    });
};

export const downloadLatestPDF = (req, res) => {
    const pdfDirectory = path.resolve('uploads/pdf');

    // Read all files in the PDF directory
    fs.readdir(pdfDirectory, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading directory' });
        }

        // Filter PDF files and sort them by modification date (latest first)
        const pdfFiles = files.filter(file => file.endsWith('.pdf'))
                               .sort((a, b) => fs.statSync(path.join(pdfDirectory, b)).mtime - fs.statSync(path.join(pdfDirectory, a)).mtime);

        if (pdfFiles.length === 0) {
            return res.status(404).json({ error: 'No PDF files found' });
        }

        // Get the most recent PDF file
        const latestFile = pdfFiles[0];
        const filePath = path.join(pdfDirectory, latestFile);

        // Send the file for download
        res.download(filePath, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error downloading the file' });
            }
        });
    });
};
// Controller function to create a new product
export function addOnce(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check if the images files were uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "At least one image file is required" });
    }

    // Prepare the product data for creation
    const productData = {
        name: req.body.name,
        description: req.body.description,
        prix: req.body.prix,
        etat: req.body.etat,
        qnt: req.body.qnt,
        images: req.files.map(file => file.filename), 
        idCategorie: req.body.idCategorie,
        sousCategorie: req.body.sousCategorie,

    };
      // Optionally, append full image paths (to be used when sending response)
      const fullProductData = {
        ...productData,
        images: productData.images.map(filename => `/images/${filename}`), // Add full path for images
    };
    Product.create(fullProductData)
        .then((newProduct) => {
            res.status(201).json(newProduct); // Return the newly created product
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error creating product: ' + err.message });
        });
}

// Controller function to update a product by ID
export function updateOnce(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Prepare the update data
    const updateData = {
        name: req.body.name,
        description: req.body.description,
        prix: req.body.prix,
        etat: req.body.etat,
        qnt: req.body.qnt,
        idCategorie: req.body.idCategorie,
        sousCategorie: req.body.sousCategorie,
        images: req.files.map(file => file.filename), 


    };

    // Handle the images if provided
    if (req.files && req.files.length > 0) {
        updateData.images = req.files.map(file => file.filename); // Update images with new filenames
    }

    Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
        .then((updatedProduct) => {
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(updatedProduct); // Return the updated product
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error updating product: ' + err.message });
        });
}

// export function addOnce(req, res) {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ error: 'At least one image file is required' });
//     }

//     const productData = {
//         name: req.body.name,
//         description: req.body.description,
//         prix: req.body.prix,
//         etat: req.body.etat,
//         qnt: req.body.qnt,
//         images: [],  // Array to hold the image URLs
//         idCategorie: req.body.idCategorie,
//         sousCategorie: req.body.sousCategorie,
//     };

//     // Upload files to Firebase Storage
//     const uploadPromises = req.files.map(file => {
//         const fileName = Date.now() + '.' + file.originalname.split('.').pop();  // Creating a unique file name
//         const fileBuffer = file.buffer;

//         const fileUpload = bucket.file(fileName).save(fileBuffer, {
//             metadata: { contentType: file.mimetype },
//         });

//         return fileUpload.then(() => {
//             const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
//             productData.images.push(fileUrl);  // Store the file URL in the product data
//         });
//     });

//     // After all files are uploaded, create the product
//     Promise.all(uploadPromises)
//         .then(() => {
//             return Product.create(productData);
//         })
//         .then((newProduct) => {
//             res.status(201).json(newProduct);
//         })
//         .catch((err) => {
//             res.status(500).json({ error: 'Error uploading images or creating product: ' + err.message });
//         });
// }

// // Controller function to update a product by ID
// export function updateOnce(req, res) {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const updateData = {
//         name: req.body.name,
//         description: req.body.description,
//         prix: req.body.prix,
//         etat: req.body.etat,
//         qnt: req.body.qnt,
//         idCategorie: req.body.idCategorie,
//         sousCategorie: req.body.sousCategorie,
//     };

//     if (req.files && req.files.length > 0) {
//         // Upload new images to Firebase
//         const uploadPromises = req.files.map(file => {
//             const fileName = Date.now() + '.' + file.originalname.split('.').pop();
//             const fileBuffer = file.buffer;

//             return bucket.file(fileName).save(fileBuffer, {
//                 metadata: { contentType: file.mimetype },
//             }).then(() => {
//                 const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
//                 return fileUrl;
//             });
//         });

//         // After uploading images, update the product
//         Promise.all(uploadPromises)
//             .then((uploadedImages) => {
//                 updateData.images = uploadedImages;  // Add the URLs of new images to the product data
//                 return Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
//             })
//             .then((updatedProduct) => {
//                 if (!updatedProduct) {
//                     return res.status(404).json({ message: 'Product not found' });
//                 }
//                 res.json(updatedProduct);
//             })
//             .catch((err) => {
//                 res.status(500).json({ error: 'Error updating product: ' + err.message });
//             });
//     } else {
//         // If no new images are uploaded, just update other fields
//         Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
//             .then((updatedProduct) => {
//                 if (!updatedProduct) {
//                     return res.status(404).json({ message: 'Product not found' });
//                 }
//                 res.json(updatedProduct);
//             })
//             .catch((err) => {
//                 res.status(500).json({ error: 'Error updating product: ' + err.message });
//             });
//     }
// }


// Controller function to get all products with category details
export function getAll(req, res) {
    Product.find()
        .populate('idCategorie') // Include category details in the product data
        .then((products) => {
            res.json(products);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error retrieving products: ' + err.message });
        });
}

// Controller function to get a product by ID with category details
export function getOneById(req, res) {
    Product.findById(req.params.id)
        .populate('idCategorie') // Include category details in the product data
        .then((foundProduct) => {
            if (!foundProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(foundProduct);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error retrieving product: ' + err.message });
        });
}

// Controller function to delete a product by ID
export function deleteOnce(req, res) {
    Product.findByIdAndDelete(req.params.id)
        .then((deletedProduct) => {
            if (!deletedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json({ message: 'Product deleted successfully' });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error deleting product: ' + err.message });
        });
}

// Controller function to count all products
export function countProducts(req, res) {
    Product.countDocuments()
        .then((count) => {
            res.json({ totalProducts: count }); // Return the total product count
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error counting products: ' + err.message });
        });
}
// Controller function to get the four newest products
export function getNewestProducts(req, res) {
    Product.find()
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .limit(10) // Limit the results to 10
        .populate('idCategorie') // Include category details in the product data
        .then((newestProducts) => {
            res.json(newestProducts); // Return the newest products
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error retrieving newest products: ' + err.message });
        });
}
// Controller function to get 8 random products
export function getRandomProducts(req, res) {
    Product.aggregate([
        { $sample: { size: 8 } } // Randomly selects 8 products
    ])
    .populate('idCategorie') // Include category details in the product data
    .then((randomProducts) => {
        res.json(randomProducts); // Return the randomly selected products
    })
    .catch((err) => {
        res.status(500).json({ error: 'Error retrieving random products: ' + err.message });
    });
}
// Controller function to get all products for a selected category
export function getProductsByCategory(req, res) {
    const { categorieId } = req.params; // Retrieve category ID from URL parameters

    Product.find({ idCategorie: categorieId }) // Filter products by category ID
        .populate('idCategorie') // Include category details in the product data
        .then((products) => {
            if (products.length === 0) {
                return res.status(404).json({ message: 'No products found for this category' });
            }
            res.json(products); // Return products for the specified category
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error retrieving products by category: ' + err.message });
        });
}
// Controller function to apply a discount to a product by price or percentage
export function applyDiscount(req, res) {
    const { discountType, discountValue } = req.body;

    // Validate the discount inputs
    if (!['price', 'percentage'].includes(discountType) || typeof discountValue !== 'number' || discountValue < 0) {
        return res.status(400).json({ error: 'Invalid discount type or value' });
    }

    Product.findById(req.params.id)
        .then((product) => {
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            let newPrice;

            // Save the old price before updating
            product.oldPrix = product.prix;

            if (discountType === 'price') {
                newPrice = product.prix - discountValue;
            } else if (discountType === 'percentage') {
                newPrice = product.prix - (product.prix * (discountValue / 100));
            }

            // Ensure the new price does not go below zero
            newPrice = Math.max(newPrice, 0);

            // Update the product price
            product.prix = newPrice;

            return product.save();
        })
        .then((updatedProduct) => {
            res.json(updatedProduct); // Return the updated product
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error applying discount: ' + err.message });
        });
}