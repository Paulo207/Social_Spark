import express from 'express';
import supportService from '../services/supportService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Start or get conversation
router.post('/start', async (req, res) => {
    try {
        const { userId, sessionId } = req.body;

        // Check for existing active conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { userId: userId || undefined },
                    { sessionId: sessionId }
                ],
                status: 'active'
            },
            orderBy: { lastMessageAt: 'desc' }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    userId,
                    sessionId,
                    status: 'active'
                }
            });
        }

        res.json(conversation);
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ error: 'Failed to start conversation' });
    }
});

// Send message
router.post('/chat', async (req, res) => {
    try {
        const { conversationId, message, userId } = req.body;

        // Ensure conversation exists
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Get AI response
        const response = await supportService.getResponse(conversationId, message, userId);

        res.json(response);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Get conversation history
router.get('/history/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { timestamp: 'asc' },
            include: {
                feedback: true
            }
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Submit feedback
router.post('/feedback', async (req, res) => {
    try {
        const { messageId, rating, comment } = req.body;

        await supportService.submitFeedback(messageId, rating, comment);

        res.json({ success: true });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// Get stats
router.get('/stats', async (req, res) => {
    try {
        const stats = await supportService.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
