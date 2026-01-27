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
                    // Prepare upload options
                    const options: any = {
                        resource_type: "auto",
                    };

                    // Only include upload_preset if it exists and we're NOT doing a signed upload
                    // or if specifically required by the user configuration.
                    const preset = settings?.cloudinaryUploadPreset || process.env.CLOUDINARY_UPLOAD_PRESET;
                    if (preset && preset !== 'ml_default') {
                        options.upload_preset = preset;
                    }

                    console.log(`[Cloudinary] Uploading media with options:`, { resource_type: options.resource_type, hasPreset: !!options.upload_preset });

                    // Upload using Cloudinary SDK
                    const result = await cloudinary.uploader.upload(img, options);

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
