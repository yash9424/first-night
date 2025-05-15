const Contact = require('../models/contact');

// Create new contact message
exports.createContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const contact = new Contact({
            name,
            email,
            phone,
            subject,
            message
        });

        await contact.save();

        res.status(201).json({
            message: 'Contact message sent successfully',
            contact: {
                id: contact._id,
                name: contact.name,
                email: contact.email
            }
        });
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({ message: 'Failed to send contact message' });
    }
};

// Get all contact messages (admin only)
exports.getAllContacts = async (req, res) => {
    try {
        const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        // Build query
        let query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with sorting
        const contacts = await Contact.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .populate('adminNotes.addedBy', 'name email');

        res.json({
            contacts,
            total: contacts.length
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ message: 'Failed to fetch contact messages' });
    }
};

// Get contact by ID (admin only)
exports.getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id)
            .populate('adminNotes.addedBy', 'name email');

        if (!contact) {
            return res.status(404).json({ message: 'Contact message not found' });
        }

        res.json(contact);
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({ message: 'Failed to fetch contact message' });
    }
};

// Update contact status (admin only)
exports.updateContactStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact message not found' });
        }

        contact.status = status;

        if (note) {
            contact.adminNotes.push({
                note,
                addedBy: req.user.id
            });
        }

        await contact.save();

        res.json({
            message: 'Contact status updated successfully',
            contact: {
                id: contact._id,
                status: contact.status,
                updatedAt: contact.updatedAt
            }
        });
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({ message: 'Failed to update contact status' });
    }
};

// Delete contact (admin only)
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact message not found' });
        }

        await contact.deleteOne();
        res.json({ message: 'Contact message deleted successfully' });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ message: 'Failed to delete contact message' });
    }
};

// Add admin note to contact (admin only)
exports.addNote = async (req, res) => {
    try {
        const { note } = req.body;
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact message not found' });
        }

        contact.adminNotes.push({
            note,
            addedBy: req.user.id
        });

        await contact.save();

        res.json({
            message: 'Note added successfully',
            note: contact.adminNotes[contact.adminNotes.length - 1]
        });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ message: 'Failed to add note' });
    }
}; 