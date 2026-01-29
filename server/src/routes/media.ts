
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { generateMediaMetadata } from '../services/aiService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
}).single('file');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to upload stream
const uploadToCloudinary = (buffer: Buffer, mimetype: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const options: any = {
            resource_type: 'auto',
        };

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

// GET /api/media - List all media assets for authenticated user
router.get('/', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    try {
        const [assets, total] = await Promise.all([
            prisma.mediaAsset.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.mediaAsset.count({ where: { userId } })
        ]);

        // Parse JSON fields
        const parsedAssets = assets.map(asset => ({
            ...asset,
            aiHashtags: asset.aiHashtags ? JSON.parse(asset.aiHashtags) : null,
            aiAnalysis: asset.aiAnalysis ? JSON.parse(asset.aiAnalysis) : null,
            userTags: asset.userTags ? JSON.parse(asset.userTags) : null
        }));

        res.json({
            assets: parsedAssets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error('List Media Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/media/:id - Get single media asset
router.get('/:id', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const id = req.params.id as string;

    try {
        const asset = await prisma.mediaAsset.findFirst({
            where: { id, userId }
        });

        if (!asset) {
            return res.status(404).json({ error: 'Media asset not found' });
        }

        // Parse JSON fields
        const parsedAsset = {
            ...asset,
            aiHashtags: asset.aiHashtags ? JSON.parse(asset.aiHashtags) : null,
            aiAnalysis: asset.aiAnalysis ? JSON.parse(asset.aiAnalysis) : null,
            userTags: asset.userTags ? JSON.parse(asset.userTags) : null
        };

        res.json(parsedAsset);
    } catch (error: any) {
        console.error('Get Media Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/media - Upload new media to library
router.post('/', authenticateToken, (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({ error: `Erro no upload: ${err.message}` });
        } else if (err) {
            console.error('Unknown Upload Error:', err);
            return res.status(500).json({ error: 'Erro desconhecido no upload' });
        }

        try {
            const userId = (req as AuthRequest).user!.userId;
            const generateAI = req.body.generateAI === 'true' || req.body.generateAI === true;

            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
            }

            console.log(`Uploading media to library: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

            // Upload to Cloudinary
            const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

            console.log('Upload success:', result.secure_url);

            // Prepare media asset data
            const mediaData: any = {
                userId,
                url: result.secure_url,
                publicId: result.public_id,
                resourceType: result.resource_type,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                width: result.width,
                height: result.height,
                duration: result.duration
            };

            // Generate AI metadata if requested and it's an image
            if (generateAI && result.resource_type === 'image') {
                try {
                    console.log('Generating AI metadata for image...');
                    const metadata = await generateMediaMetadata(result.secure_url);

                    mediaData.aiCaption = metadata.caption;
                    mediaData.aiHashtags = JSON.stringify(metadata.hashtags);
                    mediaData.aiAnalysis = JSON.stringify(metadata.analysis);

                    console.log('AI metadata generated successfully');
                } catch (aiError: any) {
                    console.error('AI generation failed (continuing without AI metadata):', aiError.message);
                    // Continue without AI metadata
                }
            }

            // Save to database
            const asset = await prisma.mediaAsset.create({
                data: mediaData
            });

            // Parse JSON fields for response
            const parsedAsset = {
                ...asset,
                aiHashtags: asset.aiHashtags ? JSON.parse(asset.aiHashtags) : null,
                aiAnalysis: asset.aiAnalysis ? JSON.parse(asset.aiAnalysis) : null,
                userTags: asset.userTags ? JSON.parse(asset.userTags) : null
            };

            res.json({
                asset: parsedAsset,
                message: 'Mídia enviada com sucesso!'
            });

        } catch (error: any) {
            console.error('Media Upload Error:', error);
            res.status(500).json({ error: 'Falha no upload da mídia.', details: error.message || error });
        }
    });
});

// POST /api/media/:id/generate-ai - Generate AI metadata for existing media
router.post('/:id/generate-ai', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const id = req.params.id as string;
    const { platform } = req.body;

    try {
        const asset = await prisma.mediaAsset.findFirst({
            where: { id, userId }
        });

        if (!asset) {
            return res.status(404).json({ error: 'Media asset not found' });
        }

        if (asset.resourceType !== 'image') {
            return res.status(400).json({ error: 'AI generation only available for images' });
        }

        console.log('Generating AI metadata for existing asset:', id);
        const metadata = await generateMediaMetadata(asset.url, platform);

        const updatedAsset = await prisma.mediaAsset.update({
            where: { id },
            data: {
                aiCaption: metadata.caption,
                aiHashtags: JSON.stringify(metadata.hashtags),
                aiAnalysis: JSON.stringify(metadata.analysis)
            }
        });

        // Parse JSON fields
        const parsedAsset = {
            ...updatedAsset,
            aiHashtags: JSON.parse(updatedAsset.aiHashtags!),
            aiAnalysis: JSON.parse(updatedAsset.aiAnalysis!),
            userTags: updatedAsset.userTags ? JSON.parse(updatedAsset.userTags) : null
        };

        res.json(parsedAsset);
    } catch (error: any) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/media/:id - Update media metadata
router.put('/:id', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const id = req.params.id as string;
    const { userCaption, userTags, description } = req.body;

    try {
        const asset = await prisma.mediaAsset.findFirst({
            where: { id, userId }
        });

        if (!asset) {
            return res.status(404).json({ error: 'Media asset not found' });
        }

        const updateData: any = {};
        if (userCaption !== undefined) updateData.userCaption = userCaption;
        if (userTags !== undefined) updateData.userTags = JSON.stringify(userTags);
        if (description !== undefined) updateData.description = description;

        const updatedAsset = await prisma.mediaAsset.update({
            where: { id },
            data: updateData
        });

        // Parse JSON fields
        const parsedAsset = {
            ...updatedAsset,
            aiHashtags: updatedAsset.aiHashtags ? JSON.parse(updatedAsset.aiHashtags) : null,
            aiAnalysis: updatedAsset.aiAnalysis ? JSON.parse(updatedAsset.aiAnalysis) : null,
            userTags: updatedAsset.userTags ? JSON.parse(updatedAsset.userTags) : null
        };

        res.json(parsedAsset);
    } catch (error: any) {
        console.error('Update Media Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/media/:id - Delete media from library and Cloudinary
router.delete('/:id', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const id = req.params.id as string;

    try {
        const asset = await prisma.mediaAsset.findFirst({
            where: { id, userId }
        });

        if (!asset) {
            return res.status(404).json({ error: 'Media asset not found' });
        }

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(asset.publicId, {
                resource_type: asset.resourceType as any
            });
            console.log('Deleted from Cloudinary:', asset.publicId);
        } catch (cloudinaryError: any) {
            console.error('Cloudinary deletion error (continuing):', cloudinaryError.message);
            // Continue even if Cloudinary deletion fails
        }

        // Delete from database
        await prisma.mediaAsset.delete({ where: { id } });

        res.json({ success: true, message: 'Mídia deletada com sucesso' });
    } catch (error: any) {
        console.error('Delete Media Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
