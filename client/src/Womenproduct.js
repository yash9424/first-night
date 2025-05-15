import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, Modal, Table } from "react-bootstrap";

const Womenproduct = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({});
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);

  const getProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/Womenproducts");
    setProducts(res.data);
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/Womenproducts/${editId}`, form);
      } else {
        await axios.post("http://localhost:5000/api/Womenproducts", form); // Calling the root endpoint
      }
      setShow(false);
      setForm({});
      setEditId(null);
      getProducts();
    } catch (error) {
      console.error('Error adding/updating product:', error);
      alert('Failed to add/update product. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      await axios.delete(`http://localhost:5000/api/Womenproducts/${id}`);
      getProducts();
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item._id);
    setShow(true);
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Manage Women's Bracelets</h3>
        <Button onClick={() => setShow(true)}>Add Product</Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Original Price</th>
            <th>Discount</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td><img src={p.image} alt="product" width="50" /></td>
              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td>₹{p.originalPrice}</td>
              <td>{p.discount}%</td>
              <td>{p.description}</td>
              <td>
                <Button size="sm" onClick={() => handleEdit(p)}>Edit</Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDelete(p._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={show} onHide={() => { setShow(false); setEditId(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit" : "Add"} Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {["name", "price", "originalPrice", "discount", "image", "hoverImage", "description"].map(field => (
              <Form.Group key={field} className="mb-2">
                <Form.Label>{field}</Form.Label>
                <Form.Control
                  type={field.includes("price") || field === "discount" ? "number" : "text"}
                  value={form[field] || ""}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSubmit}>{editId ? "Update" : "Add"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Womenproduct;
