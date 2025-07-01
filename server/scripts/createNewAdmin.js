const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Replace these values as needed
const adminData = {
  name: 'Admin',
  email: 'admin@gmail.com',
  password: 'admin123',
  phone: '1234567890',
  country: 'India',
  address: 'Admin Address',
  role: 'admin'
};

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  country: String,
  address: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  await mongoose.connect('mongodb://localhost:27017/jwelery_shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Check if admin already exists
  const exists = await User.findOne({ email: adminData.email });
  if (exists) {
    console.log('Admin already exists!');
    process.exit(0);
  }

  // Hash the password
  adminData.password = await bcrypt.hash(adminData.password, 10);

  // Create admin user
  await User.create(adminData);
  console.log('Admin user created:', adminData.email);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 