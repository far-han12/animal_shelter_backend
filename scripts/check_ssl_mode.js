require('dotenv').config();
const store_id = process.env.STORE_ID;
const is_live = process.env.IS_LIVE === 'true';

console.log('--- SSLCommerz Configuration Check ---');
console.log('STORE_ID:', store_id ? 'Set' : 'Not Set');
console.log('IS_LIVE (env):', process.env.IS_LIVE);
console.log('Effective Mode:', is_live ? 'LIVE' : 'TEST');
console.log('--------------------------------------');
