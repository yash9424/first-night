import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Modal, Form, Alert, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaTrash, FaEdit } from 'react-icons/fa';

const AdminContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [statusNote, setStatusNote] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        inProgress: 0,
        resolved: 0
    });
    const navigate = useNavigate();

    // Status options
    const statusOptions = [
        { value: 'NEW', label: 'New', variant: 'primary' },
        { value: 'IN_PROGRESS', label: 'In Progress', variant: 'warning' },
        { value: 'RESOLVED', label: 'Resolved', variant: 'success' },
        { value: 'CLOSED', label: 'Closed', variant: 'secondary' }
    ];

    // Fetch contacts
    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/contact', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setContacts(response.data.contacts);

            // Calculate stats
            const total = response.data.contacts.length;
            const newCount = response.data.contacts.filter(c => c.status === 'NEW').length;
            const inProgressCount = response.data.contacts.filter(c => c.status === 'IN_PROGRESS').length;
            const resolvedCount = response.data.contacts.filter(c => c.status === 'RESOLVED').length;

            setStats({
                total,
                new: newCount,
                inProgress: inProgressCount,
                resolved: resolvedCount
            });

            setError('');
        } catch (err) {
            console.error('Fetch contacts error:', err);
            setError('Failed to fetch contacts: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // Handle view contact
    const handleView = (contact) => {
        setSelectedContact(contact);
        setShowViewModal(true);
    };

    // Handle status update
    const handleStatusUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/contact/${selectedContact._id}/status`,
                {
                    status: selectedContact.status,
                    note: statusNote
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSuccess('Status updated successfully');
            setShowStatusModal(false);
            setStatusNote('');
            fetchContacts();
        } catch (err) {
            setError('Failed to update status: ' + (err.response?.data?.message || err.message));
        }
    };

    // Handle delete contact
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this contact message?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/contact/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Contact deleted successfully');
            fetchContacts();
        } catch (err) {
            setError('Failed to delete contact: ' + (err.response?.data?.message || err.message));
        }
    };

    // Get status badge variant
    const getStatusBadge = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return (
            <Badge bg={statusOption?.variant || 'secondary'}>
                {statusOption?.label || status}
            </Badge>
        );
    };

    return (
        <div className="p-4">
            <h2 className="mb-4">Contact Messages</h2>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="bg-primary text-white">
                        <Card.Body>
                            <h6>Total Messages</h6>
                            <h2>{stats.total}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-info text-white">
                        <Card.Body>
                            <h6>New Messages</h6>
                            <h2>{stats.new}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-warning text-white">
                        <Card.Body>
                            <h6>In Progress</h6>
                            <h2>{stats.inProgress}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-success text-white">
                        <Card.Body>
                            <h6>Resolved</h6>
                            <h2>{stats.resolved}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Alerts */}
            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                    {success}
                </Alert>
            )}

            {/* Contacts Table */}
            <Table responsive striped bordered hover>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map(contact => (
                        <tr key={contact._id}>
                            <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                            <td>{contact.name}</td>
                            <td>{contact.email}</td>
                            <td>{contact.subject}</td>
                            <td>{getStatusBadge(contact.status)}</td>
                            <td>
                                <Button
                                    variant="info"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleView(contact)}
                                >
                                    <FaEye /> View
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(contact._id)}
                                >
                                    <FaTrash /> Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* View Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Contact Message Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedContact && (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Name:</strong> {selectedContact.name}
                                </Col>
                                <Col md={6}>
                                    <strong>Email:</strong> {selectedContact.email}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Phone:</strong> {selectedContact.phone}
                                </Col>
                                <Col md={6}>
                                    <strong>Status:</strong> {getStatusBadge(selectedContact.status)}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <strong>Subject:</strong> {selectedContact.subject}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <strong>Message:</strong>
                                    <p className="mt-2">{selectedContact.message}</p>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <strong>Admin Notes:</strong>
                                    {selectedContact.adminNotes?.length > 0 ? (
                                        <ul className="mt-2">
                                            {selectedContact.adminNotes.map((note, index) => (
                                                <li key={index}>
                                                    <small className="text-muted">
                                                        {new Date(note.addedAt).toLocaleString()} by {note.addedBy?.name}:
                                                    </small>
                                                    <br />
                                                    {note.note}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-2 text-muted">No notes added yet</p>
                                    )}
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setShowViewModal(false);
                            setShowStatusModal(true);
                        }}
                    >
                        <FaEdit /> Update Status
                    </Button>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Status Update Modal */}
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            value={selectedContact?.status}
                            onChange={(e) => setSelectedContact({
                                ...selectedContact,
                                status: e.target.value
                            })}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Add Note</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            placeholder="Add a note about this status update..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleStatusUpdate}>
                        Update Status
                    </Button>
                    <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminContacts; 