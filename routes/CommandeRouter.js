import express from 'express';
import {
    createCommande,
    getAllCommandes,
    getCommandeById,
    updateCommande,
    deleteCommande,
    countCmd,
    countShippedCmd,
    getAllPendingCmd,
    getAllCanceledCmd,
    getAllDeliveredCmd,
    sumDeliveredCmd,
    downloadCommandePdf
} from '../controllers/CommandeController.js';

const router = express.Router();

// Routes for Commande operations
router.post('/commande', createCommande); // Create a new commande
router.get('/commande/countcmd', countCmd); // Create a new commande
router.get('/commande/countcmd-shipped', countShippedCmd); // Create a new commande
router.get('/commande/countcmd-canceled', getAllCanceledCmd); // Create a new commande
router.get('/commande/countcmd-delivred', getAllDeliveredCmd); // Create a new commande
router.get('/commande/countcmd-pending', getAllPendingCmd); // Create a new commande
router.get('/commande/countcmd-sum', sumDeliveredCmd); // Create a new commande

router.get('/commandes', getAllCommandes); // Get all commandes
router.get('/commande-pdf/:id', downloadCommandePdf); // Get all commandes
router.get('/commande/:id', getCommandeById); // Get a specific commande
router.put('/commande/:id', updateCommande); // Update a specific commande
router.delete('/commande/:id', deleteCommande); // Delete a specific commande

export default router;
