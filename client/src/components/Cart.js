import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  // ... existing state and other code ...

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  return (
    <Container className="py-5">
      {/* ... existing cart items display ... */}
      
      {/* Update the checkout button */}
      <div className="d-grid gap-2 col-md-6 mx-auto mt-4">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </Button>
      </div>
    </Container>
  );
};

// ... rest of the file ... 