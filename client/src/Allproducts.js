// src/admin/AllProducts.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AllProducts = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const res = await axios.get('/api/products');
    setProducts(res.data);
  };

  const deleteProduct = async (id) => {
    await axios.delete(`/api/products/${id}`);
    fetchProducts(); // refresh list
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h3>All Products</h3>
      <Link to="/admin/products/add" className="btn btn-success mb-3">+ Add Product</Link>
      <table className="table table-bordered">
        <thead>
          <tr><th>Name</th><th>Price</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod._id}>
              <td>{prod.name}</td>
              <td>₹{prod.price}</td>
              <td>
                <Link to={`/admin/products/edit/${prod._id}`} className="btn btn-sm btn-primary me-2">Edit</Link>
                <button onClick={() => deleteProduct(prod._id)} className="btn btn-sm btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllProducts;
