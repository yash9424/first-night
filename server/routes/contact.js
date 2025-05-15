const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/authMiddleware');
const {
    createContact,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    addNote
} = require('../controllers/contactController');

// Public route to create contact message
router.post('/', createContact);

// Admin routes
router.get('/', [auth, adminAuth], getAllContacts);
router.get('/:id', [auth, adminAuth], getContactById);
router.put('/:id/status', [auth, adminAuth], updateContactStatus);
router.delete('/:id', [auth, adminAuth], deleteContact);
router.post('/:id/notes', [auth, adminAuth], addNote);

module.exports = router; 