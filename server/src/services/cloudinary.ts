import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const cloudinaryService = {
    async ensureMediaUploaded(post: any, settings: any) {
        const images = JSON.parse(post.images);
        let hasChanges = false;
        const newImages = [...images];

        // Configure Cloudinary
        const cloudName = settings?.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = settings?.appId || process.env.CLOUDINARY_API_KEY; // Fallback mapping, though typically separate
        const apiSecret = settings?.appSecret || process.env.CLOUDINARY_API_SECRET;

        // Better to rely on direct env vars or specific settings for API Key/Secret if they exist in DB,
        // but for now we prioritized env vars in the plan.

        cloudinary.config({
            cloud_name: cloudName,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        if (!cloudName || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            throw new Error('Credenciais do Cloudinary incompletas (Cloud Name, API Key, API Secret). Verifique o arquivo .env do servidor.');
        }

        for (let i = 0; i < newImages.length; i++) {
            const img = newImages[i];

            if (img.startsWith('data:')) {
                console.log(`[Cloudinary] Uploading Base64 media for post ${post.id}...`);

                try {
                    // Upload using Cloudinary SDK
                    // It accepts base64 data URIs directly
                    const result = await cloudinary.uploader.upload(img, {
                        resource_type: "auto",
                        upload_preset: settings?.cloudinaryUploadPreset || process.env.CLOUDINARY_UPLOAD_PRESET // Optional for signed, but good practice if defined
                    });

                    console.log(`[Cloudinary] Upload success: ${result.secure_url}`);

                    newImages[i] = result.secure_url;
                    hasChanges = true;

                } catch (error: any) {
                    console.error('[Cloudinary] Upload Error:', error.message || error);
                    throw new Error(`Falha no upload para o Cloudinary: ${error.message || error}`);
                }
            }
        }

        if (hasChanges) {
            // Update DB
            const updated = await prisma.post.update({
                where: { id: post.id },
                data: { images: JSON.stringify(newImages) }
            });
            return updated;
        }

        return post;
    }
};
