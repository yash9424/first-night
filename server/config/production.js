module.exports = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: 'production',
    CLIENT_URL: 'http://datartechnologies.com',
    API_URL: 'http://datartechnologies.com/api',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    UPLOAD_PATH: '/var/www/uploads'
}; 