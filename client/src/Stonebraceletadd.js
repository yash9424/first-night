import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form } from 'react-bootstrap';

const Stonebracelet = () => {
  const [Stonebracelet, setStonebracelet] = useState([]);
  const [show, setShow] = useState(false);
  const [currentStonebracelet, setCurrentStonebracelet] = useState({
    name: '',
    price: '',
    originalPrice: '',
    image: '',
    hoverImage: '',
    discount: '',
    description: ''
  });
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchStonebracelet();
  }, []);

  const fetchStonebracelet = async () => {
    const res = await axios.get('http://localhost:5000/api/Stonebracelet');
    setStonebracelet(res.data);
  };

  const handleShow = (Stonebracelet = {
    name: '',
    price: '',
    originalPrice: '',
    image: '',
    hoverImage: '',
    discount: '',
    description: ''
  }) => {
    setCurrentStonebracelet(Stonebracelet);
    setEditingId(Stonebracelet._id || null);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setCurrentStonebracelet({
      name: '',
      price: '',
      originalPrice: '',
      image: '',
      hoverImage: '',
      discount: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (editingId) {
      await axios.put(`http://localhost:5000/api/Stonebracelet/${editingId}`, currentStonebracelet);
    } else {
      await axios.post('http://localhost:5000/api/Stonebracelet', currentStonebracelet);
    }
    fetchStonebracelet();
    handleClose();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/Stonebracelet/${id}`);
    fetchStonebracelet();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Manage Menssilver</h2>
        <Button variant="primary" onClick={() => handleShow()}>+ Add Product</Button>
      </div>

      <Table bordered hover>
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Original Price</th>
            <th>Discount</th>
            <th>Image</th>
            <th>Hover Image</th>
            <th>Description</th>
            <th style={{ width: '120px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {Stonebracelet.map(Stonebracelet => (
            <tr key={Stonebracelet._id}>
              <td>{Stonebracelet.name}</td>
              <td>₹{Stonebracelet.price}</td>
              <td>₹{Stonebracelet.originalPrice}</td>
              <td>{Stonebracelet.discount}%</td>
              <td><img src={Stonebracelet.image} alt={Stonebracelet.name} style={{ width: '80px' }} /></td>
              <td><img src={Stonebracelet.hoverImage} alt="hover" style={{ width: '80px' }} /></td>
              <td>{Stonebracelet.description}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleShow(Stonebracelet)} className="me-2">✏️</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(Stonebracelet._id)}>🗑️</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={currentStonebracelet.name}
                onChange={e => setCurrentStonebracelet({ ...currentStonebracelet, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={currentStonebracelet.price}
                onChange={e => setCurrentStonebracelet({ ...currentStonebracelet, price: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Original Price</Form.Label>
              <Form.Control
                type="number"
                value={currentStonebracelet.originalPrice}
                onChange={e => setCurrentStonebracelet({ ...currentStonebracelet, originalPrice: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Discount (%)</Form.Label>
              <Form.Control
                type="number"
                value={currentStonebracelet.discount}
                onChange={e => setCurrentStonebracelet({ ...currentStonebracelet, discount: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Main Image URL</Form.Label>
              <Form.Control
                value={currentStonebracelet.image}
                onChange={e => setCurrentStonebracelet({ ...currentStonebracelet, image: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Hover Image URL</Form.Label>
              <Form.Control
                value={currentStonebracelet.hoverImage}
                onChange={e => setCurrentStonebracelet({ ...currentStonebracelet, hoverImage: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                value={currentStonebracelet.description}
                onChange={e => setCurrentStonebracelet({ ...currentStonebracelet, description: e.target.value })}
              />
            </Form.Group>
            
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="success" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Stonebracelet;
