
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import { socialService } from './services/social';
import { TokenMonitorService } from './services/tokenMonitor';
import { cloudinaryService } from './services/cloudinary';
import dotenv from 'dotenv';
import { authenticateToken, AuthRequest } from './middleware/auth';

dotenv.config();

import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import aiRoutes from './routes/ai';
import supportRoutes from './routes/supportRoutes';
import mediaRoutes from './routes/media';

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

// Debug Logging Middleware
app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/media', mediaRoutes);


// --- ROUTES ---

// 1. Posts
app.get('/api/posts', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const posts = await prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    const parsedPosts = posts.map(p => ({
        ...p,
        images: JSON.parse(p.images)
    }));
    res.json(parsedPosts);
});

app.post('/api/posts', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const { images, ...data } = req.body;
    const post = await prisma.post.create({
        data: {
            ...data,
            images: JSON.stringify(images),
            userId
        }
    });
    res.json({ ...post, images: JSON.parse(post.images) });
});

// General Update
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const { id } = req.params as { id: string };
    const { images, ...data } = req.body;

    // Check ownership
    const existing = await prisma.post.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Post not found or unauthorized' });

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
app.put('/api/posts/:id/status', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const { id } = req.params as { id: string };
    const { status, publishedAt } = req.body;

    const existing = await prisma.post.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Post not found or unauthorized' });

    const post = await prisma.post.update({
        where: { id },
        data: { status, publishedAt }
    });
    res.json(post);
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const { id } = req.params as { id: string };

    const existing = await prisma.post.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Post not found or unauthorized' });

    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
});

// Publish Now Endpoint
app.post('/api/posts/:id/publish', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const { id } = req.params as { id: string };

    try {
        let post = await prisma.post.findUnique({ where: { id } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Ownership check
        if (post.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const account = await prisma.account.findUnique({ where: { id: post.accountId } });
        if (!account) {
            console.error(`[Publish] Account ${post.accountId} not found for post ${id}`);
            return res.status(404).json({ error: 'Account not found' });
        }

        console.log(`[Publish] Publishing post ${id} to ${account.platform} (Account: ${account.username})`);

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
app.get('/api/accounts', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const accounts = await prisma.account.findMany({ where: { userId } });
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

app.post('/api/accounts', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
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
            originalResponse: JSON.stringify(enrichedResponse),
            userId
        }
    });
    res.json({
        ...account,
        originalResponse: JSON.parse(account.originalResponse),
        pageId,
        igUserId
    });
});

app.delete('/api/accounts/:id', authenticateToken, async (req, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const { id } = req.params as { id: string };

    const existing = await prisma.account.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Account not found or unauthorized' });

    await prisma.account.delete({ where: { id } });
    res.json({ success: true });
});

// 3. Settings
// Settings are global for now OR should be per user if we are multi-tenant? 
// The initial request said "just only see and edit THEIR posts and accounts". 
// Usually settings like App ID / Secret are global (SaaS owner settings), OR per user (if they bring their own keys).
// Assuming single-instance SaaS where the ADMIN sets the keys, and users use them.
// So we might keep settings unprotected OR protect it so only logged checks, but for now let's protect it but allow shared access?
// Or maybe specific user role?
// For now, let's keep settings as is, maybe protecting it so at least you need to be logged in to see API keys (security), 
// but we didn't specify multi-tenant settings in the plan.
// Actually, if it's "SaaS", usually the platform provides the keys. 
// Let's protect GET/POST settings so random internet people can't change keys.
// But we won't filter by userId as the Schema doesn't have userId on Settings.

app.get('/api/settings', authenticateToken, async (req, res) => {
    const settings = await prisma.settings.findFirst();
    res.json(settings || { appId: '', appSecret: '' });
});

app.post('/api/settings', authenticateToken, async (req, res) => {
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
