import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const payload = { user: 'demo-user' };
const secret = process.env.JWT_SECRET;
const options = { expiresIn: '1h' };

const token = jwt.sign(payload, secret, options);

console.log(' Generated JWT:\n');
console.log(token);
console.log(' Copy and use this token in your curl requests.\n');
