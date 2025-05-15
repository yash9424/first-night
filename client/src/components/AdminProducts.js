import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const AdminProducts = () => {
  const initialFormState = {
    name: '',
    description: '',
    priceINR: '',
    priceUSD: '',
    discountedPriceINR: '',
    discountedPriceUSD: '',
    discountPercentageINR: '',
    discountPercentageUSD: '',
    category: '',
    stock: '0',
    mainImage: null,
    hoverImage: null
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const [imagePreview, setImagePreview] = useState({
    main: null,
    hover: null
  });
  const [onlineImageUrls, setOnlineImageUrls] = useState(['']);
  const { categorySlug } = useParams();

  const categories = [
   
    { value: 'womenbracelet', label: "Women's Bracelet" },
    { value: 'womenearings', label: "Women's Earrings" },
    { value: 'womennecles', label: "Women's Necklaces" },
    { value: 'manglsutra', label: "Mangalsutra" },
    { value: 'womensmala', label: "Women's Mala" },
    { value: 'wstonebracelte', label: "Women's Stone Bracelet" },
    { value: 'wedding', label: "Wedding Collection" },
    { value: 'officewear', label: "Office Wear" }
  ];

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      setProducts(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        // Redirect to login page if needed
      } else {
        setError('Error fetching products: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/products/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Error fetching stats: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setLoading(false);
        return;
      }

      // Validate form
      const errors = validateForm();
      if (errors.length > 0) {
        setError(errors.join('\n'));
        setLoading(false);
        return;
      }

      // Prepare FormData
      const data = new FormData();
      data.append('name', formData.name?.trim());
      data.append('description', formData.description?.trim());
      data.append('priceINR', formData.priceINR);
      data.append('priceUSD', formData.priceUSD);
      data.append('category', formData.category?.trim());
      data.append('stock', formData.stock || 0);

      // Only append discount fields if they exist
      if (formData.discountedPriceINR) data.append('discountedPriceINR', formData.discountedPriceINR);
      if (formData.discountedPriceUSD) data.append('discountedPriceUSD', formData.discountedPriceUSD);
      if (formData.discountPercentageINR) data.append('discountPercentageINR', formData.discountPercentageINR);
      if (formData.discountPercentageUSD) data.append('discountPercentageUSD', formData.discountPercentageUSD);

      // Append images
      if (formData.mainImage) {
        data.append('mainImage', formData.mainImage);
      }
      if (formData.hoverImage) {
        data.append('hoverImage', formData.hoverImage);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      let response;
      if (selectedProduct) {
        response = await axios.put(
          `http://localhost:5000/api/products/${selectedProduct._id}`,
          data,
          config
        );
      } else {
        response = await axios.post('http://localhost:5000/api/products', data, config);
      }

      if (response.data) {
        setSuccess(selectedProduct ? 'Product updated successfully' : 'Product added successfully');
        fetchProducts();
        handleClose();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        // Redirect to login page if needed
      } else {
        setError(error.response?.data?.message || 'Error saving product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess('Product deleted successfully');
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        // Redirect to login page if needed
      } else {
        setError('Error deleting product: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      priceINR: product.priceINR?.toString() || '',
      priceUSD: product.priceUSD?.toString() || '',
      discountedPriceINR: product.discountedPriceINR?.toString() || '',
      discountedPriceUSD: product.discountedPriceUSD?.toString() || '',
      discountPercentageINR: product.discountPercentageINR?.toString() || '',
      discountPercentageUSD: product.discountPercentageUSD?.toString() || '',
      category: product.category || '',
      stock: product.stock?.toString() || '0',
      mainImage: null,
      hoverImage: null
    });
    setImagePreview({
      main: product.mainImage ? `http://localhost:5000${product.mainImage}` : null,
      hover: product.hoverImage ? `http://localhost:5000${product.hoverImage}` : null
    });
    setError(null);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setFormData(initialFormState);
    setImagePreview({
      main: null,
      hover: null
    });
    setError(null);
    setShowModal(true);
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type]: file
      }));
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      if (type === 'mainImage') {
        setImagePreview(prev => ({ ...prev, main: previewUrl }));
      } else {
        setImagePreview(prev => ({ ...prev, hover: previewUrl }));
      }
    }
  };

  const handleOnlineImageUrlChange = (idx, value) => {
    const updated = [...onlineImageUrls];
    updated[idx] = value;
    setOnlineImageUrls(updated);
    // Update preview
    setImagePreview((formData.images || []).map(f => URL.createObjectURL(f)).concat(updated.filter(Boolean)));
  };

  const addOnlineImageUrl = () => setOnlineImageUrls([...onlineImageUrls, '']);
  const removeOnlineImageUrl = (idx) => {
    const updated = onlineImageUrls.filter((_, i) => i !== idx);
    setOnlineImageUrls(updated);
    setImagePreview((formData.images || []).map(f => URL.createObjectURL(f)).concat(updated.filter(Boolean)));
  };

  const calculateDiscount = (mainPrice, discountedPrice) => {
    if (!mainPrice || !discountedPrice) return '';
    const discount = ((mainPrice - discountedPrice) / mainPrice) * 100;
    return Math.round(discount);
  };

  const handlePriceChange = (e, field) => {
    const value = e.target.value;
    const updates = { ...formData };

    if (field === 'priceINR') {
      updates.priceINR = value;
      // Calculate discounted price if percentage exists
      if (updates.discountPercentageINR) {
        const discount = parseFloat(updates.discountPercentageINR);
        if (!isNaN(discount) && !isNaN(value)) {
          updates.discountedPriceINR = (parseFloat(value) * (1 - discount / 100)).toFixed(2);
        }
      }
    } else if (field === 'priceUSD') {
      updates.priceUSD = value;
      // Calculate discounted price if percentage exists
      if (updates.discountPercentageUSD) {
        const discount = parseFloat(updates.discountPercentageUSD);
        if (!isNaN(discount) && !isNaN(value)) {
          updates.discountedPriceUSD = (parseFloat(value) * (1 - discount / 100)).toFixed(2);
        }
      }
    } else if (field === 'discountedPriceINR') {
      updates.discountedPriceINR = value;
      // Calculate percentage based on discounted price
      const mainPrice = parseFloat(updates.priceINR);
      const discountedPrice = parseFloat(value);
      if (!isNaN(mainPrice) && !isNaN(discountedPrice) && mainPrice > 0) {
        const percentage = ((mainPrice - discountedPrice) / mainPrice * 100).toFixed(0);
        updates.discountPercentageINR = percentage;
      }
    } else if (field === 'discountedPriceUSD') {
      updates.discountedPriceUSD = value;
      // Calculate percentage based on discounted price
      const mainPrice = parseFloat(updates.priceUSD);
      const discountedPrice = parseFloat(value);
      if (!isNaN(mainPrice) && !isNaN(discountedPrice) && mainPrice > 0) {
        const percentage = ((mainPrice - discountedPrice) / mainPrice * 100).toFixed(0);
        updates.discountPercentageUSD = percentage;
      }
    } else if (field === 'discountPercentageINR') {
      updates.discountPercentageINR = value;
      // Calculate discounted price based on percentage
      const mainPrice = parseFloat(updates.priceINR);
      const discount = parseFloat(value);
      if (!isNaN(mainPrice) && !isNaN(discount)) {
        updates.discountedPriceINR = (mainPrice * (1 - discount / 100)).toFixed(2);
      }
    } else if (field === 'discountPercentageUSD') {
      updates.discountPercentageUSD = value;
      // Calculate discounted price based on percentage
      const mainPrice = parseFloat(updates.priceUSD);
      const discount = parseFloat(value);
      if (!isNaN(mainPrice) && !isNaN(discount)) {
        updates.discountedPriceUSD = (mainPrice * (1 - discount / 100)).toFixed(2);
      }
    }

    setFormData(updates);
  };

  const validateForm = () => {
    const errors = [];
    
    // Required fields validation with trimming
    if (!formData.name?.trim()) {
        errors.push('Name is required');
    }
    
    if (!formData.description?.trim()) {
        errors.push('Description is required');
    }
    
    // Category validation
    if (!formData.category?.trim()) {
        errors.push('Category is required');
    } else if (!categories.some(cat => cat.value === formData.category.trim())) {
        errors.push('Invalid category selected');
    }

    // Price validation for INR
    const priceINR = parseFloat(formData.priceINR);
    if (!priceINR || isNaN(priceINR)) {
        errors.push('Price in INR is required');
    } else if (priceINR <= 0) {
        errors.push('Price in INR must be greater than 0');
    }

    // Price validation for USD
    const priceUSD = parseFloat(formData.priceUSD);
    if (!priceUSD || isNaN(priceUSD)) {
        errors.push('Price in USD is required');
    } else if (priceUSD <= 0) {
        errors.push('Price in USD must be greater than 0');
    }

    // Discounted price validation for INR
    if (formData.discountedPriceINR) {
        const discountedPriceINR = parseFloat(formData.discountedPriceINR);
        if (isNaN(discountedPriceINR)) {
            errors.push('Discounted price in INR must be a valid number');
        } else if (discountedPriceINR >= priceINR) {
            errors.push('Discounted price in INR must be less than the original price');
        } else if (discountedPriceINR < 0) {
            errors.push('Discounted price in INR cannot be negative');
        }
    }

    // Discounted price validation for USD
    if (formData.discountedPriceUSD) {
        const discountedPriceUSD = parseFloat(formData.discountedPriceUSD);
        if (isNaN(discountedPriceUSD)) {
            errors.push('Discounted price in USD must be a valid number');
        } else if (discountedPriceUSD >= priceUSD) {
            errors.push('Discounted price in USD must be less than the original price');
        } else if (discountedPriceUSD < 0) {
            errors.push('Discounted price in USD cannot be negative');
        }
    }

    // Discount percentage validation for INR
    if (formData.discountPercentageINR) {
        const discountINR = parseFloat(formData.discountPercentageINR);
        if (isNaN(discountINR)) {
            errors.push('Discount percentage for INR must be a valid number');
        } else if (discountINR < 0 || discountINR > 100) {
            errors.push('Discount percentage for INR must be between 0 and 100');
        }
    }

    // Discount percentage validation for USD
    if (formData.discountPercentageUSD) {
        const discountUSD = parseFloat(formData.discountPercentageUSD);
        if (isNaN(discountUSD)) {
            errors.push('Discount percentage for USD must be a valid number');
        } else if (discountUSD < 0 || discountUSD > 100) {
            errors.push('Discount percentage for USD must be between 0 and 100');
        }
    }
    
    // Stock validation
    const stock = parseInt(formData.stock);
    if (isNaN(stock)) {
        errors.push('Stock must be a valid number');
    } else if (stock < 0) {
        errors.push('Stock cannot be negative');
    }

    // Image validation
    if (!selectedProduct) {  // Only validate for new products
        if (!formData.mainImage) {
            errors.push('Main product image is required');
        }
    }

    // Validate image types if they are provided
    if (formData.mainImage && !isValidImageType(formData.mainImage)) {
        errors.push('Main image must be a valid image file (jpg, jpeg, png, webp)');
    }
    if (formData.hoverImage && !isValidImageType(formData.hoverImage)) {
        errors.push('Hover image must be a valid image file (jpg, jpeg, png, webp)');
    }
    
    return errors;
  };

  // Helper function to validate image types
  const isValidImageType = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return file && validTypes.includes(file.type);
  };

  const handleClose = () => {
    setShowModal(false);
    setError(null);
    setSelectedProduct(null);
    setFormData(initialFormState);
    setImagePreview({
      main: null,
      hover: null
    });
  };

  // Add a debug function to check form data
  const debugFormData = () => {
    console.log('Current form data:', {
      name: formData.name,
      description: formData.description,
      priceINR: formData.priceINR,
      priceUSD: formData.priceUSD,
      category: formData.category,
      stock: formData.stock,
      hasImages: formData.images?.length > 0
    });
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Products Management</h2>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="bg-primary text-white">
            <Card.Body>
              <h6>Total Products</h6>
              <h2>{stats.total}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-warning text-white">
            <Card.Body>
              <h6>Low Stock Products</h6>
              <h2>{stats.lowStock}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-danger text-white">
            <Card.Body>
              <h6>Out of Stock</h6>
              <h2>{stats.outOfStock}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      {/* Add Product Button */}
      <div className="mb-4">
        <Button variant="primary" onClick={handleAdd}>
          <FaPlus className="me-2" /> Add New Product
        </Button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover className="bg-white shadow-sm">
            <thead className="bg-light">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Main Price (INR)</th>
                <th>Main Price (USD)</th>
                <th>Discounted Price (INR)</th>
                <th>Discounted Price (USD)</th>
                <th>Discount %</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    {product.mainImage ? (
                      <img
                        src={`http://localhost:5000${product.mainImage}`}
                        alt={product.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                        }}
                      />
                    ) : (
                      <FaImage size={24} className="text-muted" />
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>
                    {product.category}
                    <small className="d-block text-muted">
                      (exact: "{product.category}")
                    </small>
                  </td>
                  <td>₹{product.priceINR}</td>
                  <td>${product.priceUSD}</td>
                  <td>
                    <span className="text-success">₹{product.discountedPriceINR}</span>
                  </td>
                  <td>
                    <span className="text-success">${product.discountedPriceUSD}</span>
                  </td>
                  <td>
                    {product.discountPercentageINR > 0 && (
                      <span className="badge bg-success">
                        {product.discountPercentageINR}% OFF
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      product.stock === 0 
                        ? 'bg-danger' 
                        : product.stock < 10 
                        ? 'bg-warning' 
                        : 'bg-success'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(product)}
                    >
                      <FaEdit /> Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                    >
                      <FaTrash /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Product name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Product description"
              />
            </Form.Group>

            {/* INR Pricing */}
            <h5 className="mb-3">INR Pricing</h5>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (INR) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.priceINR}
                    onChange={(e) => handlePriceChange(e, 'priceINR')}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter price in INR"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discounted Price (INR)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.discountedPriceINR}
                    onChange={(e) => handlePriceChange(e, 'discountedPriceINR')}
                    min="0"
                    step="0.01"
                    placeholder="Enter discounted price in INR"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount % (INR)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.discountPercentageINR}
                    onChange={(e) => handlePriceChange(e, 'discountPercentageINR')}
                    min="0"
                    max="100"
                    step="1"
                    placeholder="Enter discount %"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* USD Pricing */}
            <h5 className="mb-3">USD Pricing</h5>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (USD) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.priceUSD}
                    onChange={(e) => handlePriceChange(e, 'priceUSD')}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter price in USD"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discounted Price (USD)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.discountedPriceUSD}
                    onChange={(e) => handlePriceChange(e, 'discountedPriceUSD')}
                    min="0"
                    step="0.01"
                    placeholder="Enter discounted price in USD"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount % (USD)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.discountPercentageUSD}
                    onChange={(e) => handlePriceChange(e, 'discountPercentageUSD')}
                    min="0"
                    max="100"
                    step="1"
                    placeholder="Enter discount %"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    min="0"
                    placeholder="Stock quantity"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Image upload fields */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Main Image *</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => handleImageChange(e, 'mainImage')}
                    accept="image/*"
                    required={!selectedProduct}
                  />
                  {(imagePreview.main || (selectedProduct && selectedProduct.mainImage)) && (
                    <div className="mt-2 position-relative" style={{ width: '100px', height: '100px' }}>
                      <img
                        src={imagePreview.main}
                        alt="Main preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hover Image</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => handleImageChange(e, 'hoverImage')}
                    accept="image/*"
                  />
                  {(imagePreview.hover || (selectedProduct && selectedProduct.hoverImage)) && (
                    <div className="mt-2 position-relative" style={{ width: '100px', height: '100px' }}>
                      <img
                        src={imagePreview.hover}
                        alt="Hover preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;