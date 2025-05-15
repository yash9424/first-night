import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form } from 'react-bootstrap';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [show, setShow] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products');
    setProducts(res.data);
  };

  const handleShow = (product = {
    name: '',
    price: '',
    originalPrice: '',
    image: '',
    hoverImage: '',
    discount: '',
    description: ''
  }) => {
    setCurrentProduct(product);
    setEditingId(product._id || null);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setCurrentProduct({
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
      await axios.put(`http://localhost:5000/api/products/${editingId}`, currentProduct);
    } else {
      await axios.post('http://localhost:5000/api/products', currentProduct);
    }
    fetchProducts();
    handleClose();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Manage Products</h2>
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
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>₹{product.price}</td>
              <td>₹{product.originalPrice}</td>
              <td>{product.discount}%</td>
              <td><img src={product.image} alt={product.name} style={{ width: '80px' }} /></td>
              <td><img src={product.hoverImage} alt="hover" style={{ width: '80px' }} /></td>
              <td>{product.description}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleShow(product)} className="me-2">✏️</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(product._id)}>🗑️</Button>
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
                value={currentProduct.name}
                onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={currentProduct.price}
                onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Original Price</Form.Label>
              <Form.Control
                type="number"
                value={currentProduct.originalPrice}
                onChange={e => setCurrentProduct({ ...currentProduct, originalPrice: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Discount (%)</Form.Label>
              <Form.Control
                type="number"
                value={currentProduct.discount}
                onChange={e => setCurrentProduct({ ...currentProduct, discount: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Main Image URL</Form.Label>
              <Form.Control
                value={currentProduct.image}
                onChange={e => setCurrentProduct({ ...currentProduct, image: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Hover Image URL</Form.Label>
              <Form.Control
                value={currentProduct.hoverImage}
                onChange={e => setCurrentProduct({ ...currentProduct, hoverImage: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                value={currentProduct.description}
                onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
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

export default Products;
