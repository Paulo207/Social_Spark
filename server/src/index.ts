
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import { socialService } from './services/social';
import { TokenMonitorService } from './services/tokenMonitor';
import { cloudinaryService } from './services/cloudinary';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || '']
        : true, // Allow all in dev
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// --- ROUTES ---

// 1. Posts
app.get('/api/posts', async (req, res) => {
    const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
    const parsedPosts = posts.map(p => ({
        ...p,
        images: JSON.parse(p.images)
    }));
    res.json(parsedPosts);
});

app.post('/api/posts', async (req, res) => {
    const { images, ...data } = req.body;
    const post = await prisma.post.create({
        data: {
            ...data,
            images: JSON.stringify(images)
        }
    });
    res.json({ ...post, images: JSON.parse(post.images) });
});

// General Update
app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { images, ...data } = req.body;

    // If updating images, stringify them
    const updateData: any = { ...data };
    if (images) {
        updateData.images = JSON.stringify(images);
    }

    const post = await prisma.post.update({
        where: { id },
        data: updateData
    });
    res.json({ ...post, images: JSON.parse(post.images) });
});

// Status Update (Legacy support if needed, or use the one above)
app.put('/api/posts/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, publishedAt } = req.body;
    const post = await prisma.post.update({
        where: { id },
        data: { status, publishedAt }
    });
    res.json(post);
});

app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
});

// Publish Now Endpoint
app.post('/api/posts/:id/publish', async (req, res) => {
    const { id } = req.params;

    try {
        let post = await prisma.post.findUnique({ where: { id } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const account = await prisma.account.findUnique({ where: { id: post.accountId } });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const settings = await prisma.settings.findFirst();

        // Ensure Media uses public URL (Uploads Base64 -> Cloudinary if needed)
        try {
            console.log(`[Publish] Ensuring media upload for post ${id}...`);
            post = await cloudinaryService.ensureMediaUploaded(post, settings);
        } catch (uploadError: any) {
            console.error('[Publish] Upload failed:', uploadError);
            return res.status(500).json({ error: 'Falha no upload de mídia: ' + uploadError.message });
        }

        const parsedAccount = {
            ...account,
            originalResponse: JSON.parse(account.originalResponse)
        };

        // Attempt publish
        console.log(`[Publish] Publishing to social API...`);
        await socialService.publishPost(post, parsedAccount);

        // Update DB
        const updated = await prisma.post.update({
            where: { id },
            data: {
                status: 'published',
                publishedAt: new Date()
            }
        });

        res.json(updated);
    } catch (error: any) {
        console.error('[Publish] Failed:', error);
        // Update DB to failed
        await prisma.post.update({
            where: { id },
            data: { status: 'failed' }
        });
        res.status(500).json({ error: error.message });
    }
});

// 2. Accounts
app.get('/api/accounts', async (req, res) => {
    const accounts = await prisma.account.findMany();
    const parsedAccounts = accounts.map(a => {
        const originalResponse = JSON.parse(a.originalResponse);
        return {
            ...a,
            originalResponse,
            pageId: originalResponse.pageId,
            igUserId: originalResponse.igUserId
        };
    });
    res.json(parsedAccounts);
});

app.post('/api/accounts', async (req, res) => {
    const { originalResponse, pageId, igUserId, lastSync, tokenExpiresAt, ...data } = req.body;

    // Store pageId and igUserId inside originalResponse for later retrieval
    const enrichedResponse = {
        ...(typeof originalResponse === 'object' ? originalResponse : {}),
        pageId,
        igUserId
    };

    const account = await prisma.account.create({
        data: {
            ...data,
            tokenExpiresAt,
            originalResponse: JSON.stringify(enrichedResponse)
        }
    });
    res.json({
        ...account,
        originalResponse: JSON.parse(account.originalResponse),
        pageId,
        igUserId
    });
});

app.delete('/api/accounts/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.account.delete({ where: { id } });
    res.json({ success: true });
});

// 3. Settings
app.get('/api/settings', async (req, res) => {
    const settings = await prisma.settings.findFirst();
    res.json(settings || { appId: '', appSecret: '' });
});

app.post('/api/settings', async (req, res) => {
    const { appId, appSecret, token, cloudinaryCloudName, cloudinaryUploadPreset } = req.body;
    const existing = await prisma.settings.findFirst();

    const data = {
        appId,
        appSecret,
        token, // Added token
        cloudinaryCloudName, // Added
        cloudinaryUploadPreset // Added
    };

    if (existing) {
        const updated = await prisma.settings.update({
            where: { id: existing.id },
            data: data
        });
        res.json(updated);
    } else {
        const created = await prisma.settings.create({
            data: data
        });
        res.json(created);
    }
});

// --- SCHEDULER (Every Minute) ---
cron.schedule('* * * * *', async () => {
    const now = new Date();
    // console.log(`[Scheduler] Checking for posts at ${now.toISOString()}`);

    try {
        const postsToPublish = await prisma.post.findMany({
            where: {
                status: 'scheduled',
                scheduledDate: { lte: now }
            }
        });

        if (postsToPublish.length > 0) {
            console.log(`[Scheduler] Found ${postsToPublish.length} posts due.`);
        }

        const settings = await prisma.settings.findFirst();

        for (const rawPost of postsToPublish) {
            let post = rawPost;
            try {
                const account = await prisma.account.findUnique({ where: { id: post.accountId } });

                if (account) {
                    // Ensure Media uses public URL (Uploads Base64 -> Cloudinary if needed)
                    try {
                        console.log(`[Scheduler] Ensuring media upload for post ${post.id}...`);
                        post = await cloudinaryService.ensureMediaUploaded(post, settings);
                    } catch (uploadError: any) {
                        console.error('[Scheduler] Upload failed:', uploadError);
                        await prisma.post.update({ where: { id: post.id }, data: { status: 'failed' } });
                        continue; // Skip trying to publish if upload failed
                    }

                    const parsedAccount = {
                        ...account,
                        originalResponse: JSON.parse(account.originalResponse)
                    };

                    console.log(`[Scheduler] Auto-publishing post ${post.id}...`);
                    await socialService.publishPost(post, parsedAccount);

                    await prisma.post.update({
                        where: { id: post.id },
                        data: {
                            status: 'published',
                            publishedAt: now
                        }
                    });
                    console.log(`[Scheduler] SUCCESS: Published post ${post.id}`);
                } else {
                    console.warn(`[Scheduler] Account not found for post ${post.id}`);
                    await prisma.post.update({ where: { id: post.id }, data: { status: 'failed' } });
                }

            } catch (error) {
                console.error(`[Scheduler] Failed to publish post ${post.id}`, error);
                await prisma.post.update({
                    where: { id: post.id },
                    data: { status: 'failed' }
                });
            }
        }
    } catch (e) {
        console.error("Scheduler Error:", e);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    TokenMonitorService.startMonitoring();
});
