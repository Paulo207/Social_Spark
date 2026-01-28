
import { Router } from 'express';
import { generateCaption } from '../services/aiService';

const router = Router();

router.post('/generate-caption', async (req, res) => {
    const { topic, platform } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const caption = await generateCaption(topic, platform);
        res.json({ caption });
    } catch (error: any) {
        console.error('AI Route Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
