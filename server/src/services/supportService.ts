import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// AI Provider Configuration
const AI_PROVIDERS = {
    openai: {
        name: 'OpenAI GPT-4',
        priority: 1,
        enabled: !!process.env.OPENAI_API_KEY
    },
    gemini: {
        name: 'Google Gemini',
        priority: 2,
        enabled: !!process.env.GEMINI_API_KEY
    },
    claude: {
        name: 'Anthropic Claude',
        priority: 3,
        enabled: !!process.env.CLAUDE_API_KEY
    },
    perplexity: {
        name: 'Perplexity',
        priority: 4,
        enabled: !!process.env.API_PERPLEXITY
    }
};

// Social Spark Knowledge Base
const SOCIAL_SPARK_CONTEXT = `
You are an AI support assistant for Social Spark, a premium social media management platform designed for content creators and businesses.

CORE PHILOSOPHY:
Social Spark combines powerful AI tools with an intuitive, breathtaking design to help users "Transform Their Social Media Presence". We prioritize aesthetics, usability, and performance.

KEY FEATURES & CAPABILITIES:

1. 🚀 CONTENT WORKFLOW (Kanban System)
   - Organize content visually: Idea -> Draft -> Review -> Scheduled -> Published
   - Drag-and-drop interface for status management
   - Create quick ideas and convert them to full posts

2. 🤖 AI POWERHOUSE
   - Smart Caption Generation: Context-aware captions based on tone and platform
   - Intelligent Hashtags: Trending and relevant hashtag suggestions
   - Best Time to Post: AI analysis of audience activity for optimal timing

3. 📅 VISUAL SCHEDULING
   - Unified Calendar View: See all posts across all platforms in one place
   - Drag-and-drop rescheduling
   - Support for multiple accounts per platform

4. 📊 ADVANCED ANALYTICS
   - Real-time insights on engagement (likes, comments, shares)
   - Audience growth tracking
   - Cross-platform performance comparison

SUPPORTED PLATFORMS:
- Instagram (Feed, Stories, Reels)
- Facebook (Personal Profiles, Pages)
- Twitter / X (Tweets, Threads)
- LinkedIn (Personal, Company Pages)

TROUBLESHOOTING GUIDE:
- "Page not loading": Suggest clearing cache or checking internet connection.
- "Post failed": Check image size/format limits or token expiration.
- "Token expired": Go to Account Manager to reconnect the social profile.

CONTACT & SUPPORT:
- Email: support@socialspark.app (Technical)
- Email: hello@socialspark.app (General)
- Availability: 24/7 AI Support, Human support within 24h for premium.

TONE & STYLE:
- Professional yet approachable.
- Concise and solution-oriented.
- Use emojis sparingly to maintain a friendly vibe.
- Always refer to "Social Spark" as the platform name.
`;

class AISupportService {
    private openai: OpenAI | null = null;

    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        }
    }

    /**
     * Get AI response with automatic provider fallback
     */
    async getResponse(
        conversationId: string,
        userMessage: string,
        userId?: string
    ): Promise<{ content: string; provider: string; messageId: string }> {
        // Get conversation history for context
        const context = await this.getConversationContext(conversationId);

        // Try providers in priority order
        const providers = Object.entries(AI_PROVIDERS)
            .filter(([_, config]) => config.enabled)
            .sort((a, b) => a[1].priority - b[1].priority);

        for (const [provider, config] of providers) {
            try {
                console.log(`Trying AI provider: ${config.name}`);
                const response = await this.callProvider(provider, userMessage, context);

                // Save message to database
                const savedMessage = await this.saveMessage(conversationId, userMessage, response, provider);

                return {
                    content: response,
                    provider,
                    messageId: savedMessage.id
                };
            } catch (error) {
                console.error(`Provider ${provider} failed:`, error);
                if (error instanceof Error) {
                    console.error('Error details:', error.message);
                    console.error('Stack:', error.stack);
                }
                continue; // Try next provider
            }
        }

        console.error('All providers failed. Available keys:', {
            openai: !!process.env.OPENAI_API_KEY,
            gemini: !!process.env.GEMINI_API_KEY,
            claude: !!process.env.CLAUDE_API_KEY,
            perplexity: !!process.env.API_PERPLEXITY
        });

        throw new Error('All AI providers failed');
    }

    /**
     * Call specific AI provider
     */
    private async callProvider(
        provider: string,
        userMessage: string,
        context: string[]
    ): Promise<string> {
        switch (provider) {
            case 'openai':
                return await this.callOpenAI(userMessage, context);
            case 'gemini':
                return await this.callGemini(userMessage, context);
            case 'claude':
                return await this.callClaude(userMessage, context);
            case 'perplexity':
                return await this.callPerplexity(userMessage, context);
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }

    /**
     * OpenAI GPT-4 implementation
     */
    private async callOpenAI(userMessage: string, context: string[]): Promise<string> {
        if (!this.openai) throw new Error('OpenAI not configured');

        const messages: any[] = [
            { role: 'system', content: SOCIAL_SPARK_CONTEXT }
        ];

        // Add conversation history
        context.forEach((msg, index) => {
            messages.push({
                role: index % 2 === 0 ? 'user' : 'assistant',
                content: msg
            });
        });

        // Add current message
        messages.push({ role: 'user', content: userMessage });

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages,
            temperature: 0.7,
            max_tokens: 500
        });

        return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    }

    /**
     * Google Gemini implementation
     */
    private async callGemini(userMessage: string, context: string[]): Promise<string> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Gemini not configured');

        const prompt = `${SOCIAL_SPARK_CONTEXT}\n\nConversation History:\n${context.join('\n')}\n\nUser: ${userMessage}\nAssistant:`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500
                    }
                })
            }
        );

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    }

    /**
     * Anthropic Claude implementation
     */
    private async callClaude(userMessage: string, context: string[]): Promise<string> {
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) throw new Error('Claude not configured');

        const messages: any[] = [];

        // Add conversation history
        context.forEach((msg, index) => {
            messages.push({
                role: index % 2 === 0 ? 'user' : 'assistant',
                content: msg
            });
        });

        // Add current message
        messages.push({ role: 'user', content: userMessage });

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 500,
                system: SOCIAL_SPARK_CONTEXT,
                messages
            })
        });

        const data = await response.json();
        return data.content?.[0]?.text || 'Sorry, I could not generate a response.';
    }

    /**
     * Perplexity implementation (good for research/factual queries)
     */
    private async callPerplexity(userMessage: string, context: string[]): Promise<string> {
        const apiKey = process.env.API_PERPLEXITY;
        if (!apiKey) throw new Error('Perplexity not configured');

        const messages: any[] = [
            { role: 'system', content: SOCIAL_SPARK_CONTEXT }
        ];

        context.forEach((msg, index) => {
            messages.push({
                role: index % 2 === 0 ? 'user' : 'assistant',
                content: msg
            });
        });

        messages.push({ role: 'user', content: userMessage });

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-online',
                messages
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    }

    /**
     * Get conversation context (last N messages)
     */
    private async getConversationContext(conversationId: string): Promise<string[]> {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { timestamp: 'desc' },
            take: 10 // Last 10 messages
        });

        return messages.reverse().map(msg => msg.content);
    }

    /**
   * Save message to database
   */
    private async saveMessage(
        conversationId: string,
        userMessage: string,
        aiResponse: string,
        provider: string
    ): Promise<any> {
        // Save user message
        await prisma.message.create({
            data: {
                conversationId,
                role: 'user',
                content: userMessage
            }
        });

        // Save AI response
        const aiMessage = await prisma.message.create({
            data: {
                conversationId,
                role: 'assistant',
                content: aiResponse,
                aiProvider: provider
            }
        });

        // Update conversation last message time
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        });

        return aiMessage;
    }

    /**
     * Submit feedback on a message
     */
    async submitFeedback(
        messageId: string,
        rating: number,
        comment?: string
    ): Promise<void> {
        await prisma.feedback.create({
            data: {
                messageId,
                rating,
                comment
            }
        });

        // If positive feedback, learn from it
        if (rating === 5) {
            await this.learnFromFeedback(messageId);
        }
    }

    /**
     * Learn from positive feedback
     */
    private async learnFromFeedback(messageId: string): Promise<void> {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: {
                conversation: {
                    include: {
                        messages: {
                            orderBy: { timestamp: 'asc' }
                        }
                    }
                }
            }
        });

        if (!message) return;

        // Find the user question that led to this response
        const messages = message.conversation.messages;
        const messageIndex = messages.findIndex(m => m.id === messageId);
        const userQuestion = messageIndex > 0 ? messages[messageIndex - 1] : null;

        if (userQuestion && userQuestion.role === 'user') {
            // Check if similar entry exists in knowledge base
            const existing = await prisma.knowledgeBase.findFirst({
                where: {
                    question: {
                        contains: userQuestion.content.substring(0, 50)
                    }
                }
            });

            if (existing) {
                // Update existing entry
                await prisma.knowledgeBase.update({
                    where: { id: existing.id },
                    data: {
                        timesUsed: existing.timesUsed + 1,
                        successRate: Math.min(100, existing.successRate + 5)
                    }
                });
            } else {
                // Create new knowledge base entry
                await prisma.knowledgeBase.create({
                    data: {
                        category: 'learned',
                        question: userQuestion.content,
                        answer: message.content,
                        keywords: JSON.stringify(this.extractKeywords(userQuestion.content)),
                        successRate: 80,
                        timesUsed: 1,
                        source: 'learned'
                    }
                });
            }
        }
    }

    /**
     * Extract keywords from text
     */
    private extractKeywords(text: string): string[] {
        const commonWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'how', 'what', 'when', 'where', 'why', 'can', 'do', 'does'];
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !commonWords.includes(word));

        return [...new Set(words)].slice(0, 5);
    }

    /**
     * Get learning statistics
     */
    async getStats(): Promise<any> {
        const totalConversations = await prisma.conversation.count();
        const totalMessages = await prisma.message.count();
        const totalFeedback = await prisma.feedback.count();
        const positiveFeedback = await prisma.feedback.count({
            where: { rating: 5 }
        });
        const knowledgeBaseSize = await prisma.knowledgeBase.count();

        return {
            totalConversations,
            totalMessages,
            totalFeedback,
            positiveFeedback,
            satisfactionRate: totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0,
            knowledgeBaseSize
        };
    }
}

export default new AISupportService();
