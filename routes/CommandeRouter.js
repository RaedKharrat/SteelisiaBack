import express from 'express';
import {
    createCommande,
    getAllCommandes,
    getCommandeById,
    updateCommande,
    deleteCommande,
    countCmd
} from '../controllers/CommandeController.js';

const router = express.Router();

// Routes for Commande operations
router.post('/commande', createCommande); // Create a new commande
router.post('/commande/countcmd', countCmd); // Create a new commande
router.get('/commandes', getAllCommandes); // Get all commandes
router.get('/commande/:id', getCommandeById); // Get a specific commande
router.put('/commande/:id', updateCommande); // Update a specific commande
router.delete('/commande/:id', deleteCommande); // Delete a specific commande

export default router;
