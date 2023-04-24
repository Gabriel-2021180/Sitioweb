const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './configs/env/email.env') });

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);