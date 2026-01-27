
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
}).single('file'); // Define middleware here to handle errors

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to upload stream
const uploadToCloudinary = (buffer: Buffer, mimetype: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Prepare upload options
        const options: any = {
            resource_type: 'auto',
        };

        // Only include upload_preset if it exists and we're NOT doing a signed upload
        // or if specifically required by the user configuration. 
        // For signed uploads (using API Key/Secret), upload_preset is often not needed or can cause conflict.
        if (process.env.CLOUDINARY_UPLOAD_PRESET && process.env.CLOUDINARY_UPLOAD_PRESET !== 'ml_default') {
            options.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary stream error:', error);
                    return reject(error);
                }
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

router.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({ error: `Erro no upload: ${err.message}` });
        } else if (err) {
            console.error('Unknown Upload Error:', err);
            return res.status(500).json({ error: 'Erro desconhecido no upload' });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
            }

            console.log(`Uploading file: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

            const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

            console.log('Upload success:', result.secure_url);

            res.json({
                url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type
            });

        } catch (error: any) {
            console.error('Cloudinary Error:', error);
            res.status(500).json({ error: 'Falha no upload para o Cloudinary.', details: error.message || error });
        }
    });
});

export default router;
