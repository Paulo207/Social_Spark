
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server root
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('Testing Cloudinary Upload...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing');
console.log('Upload Preset:', process.env.CLOUDINARY_UPLOAD_PRESET);

// Configure
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload() {
    try {
        // Create a buffer (small text file)
        const buffer = Buffer.from('Test file content', 'utf-8');

        console.log('Attempting upload...');

        await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    // Try WITH preset first, if fail, we know.
                    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Upload Failed:', error);
                        reject(error);
                    } else {
                        console.log('✅ Upload Success:', result?.secure_url);
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

    } catch (e: any) {
        // If failed, try WITHOUT preset
        if (e.message && e.message.includes('preset')) {
            console.log('Retrying WITHOUT preset...');
            await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'raw',
                        // NO PRESET
                    },
                    (error, result) => {
                        if (error) {
                            console.error('❌ Retry Failed:', error);
                            reject(error);
                        } else {
                            console.log('✅ Retry Success (No Preset):', result?.secure_url);
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(Buffer.from('Test file retry', 'utf-8'));
            });
        }
    }
}

testUpload();
