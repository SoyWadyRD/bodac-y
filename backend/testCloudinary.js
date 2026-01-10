require('dotenv').config({ path: __dirname + '/.env' }); // fuerza la ruta
const cloudinary = require('./config/cloudinary');

console.log('Cloud name in test:', process.env.CLOUDINARY_CLOUD_NAME);

async function test() {
  try {
    const result = await cloudinary.api.resources({ type: 'upload', max_results: 5 });
    console.log('Fotos Cloudinary:', result.resources.map(r => r.secure_url));
  } catch (err) {
    console.error('Error Cloudinary:', err);
  }
}

test();
