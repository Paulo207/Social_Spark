
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateCaption = async (topic: string, platform: 'instagram' | 'facebook' | 'both' = 'both'): Promise<string> => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    const platformContext = platform === 'instagram'
        ? 'Focus on visual storytelling, use proper hashtags, and keep it engaging for Instagram.'
        : platform === 'facebook'
            ? 'Focus on community engagement, slightly longer form if needed, for Facebook.'
            : 'Create a versatile caption suitable for both Instagram and Facebook.';

    const prompt = `
    You are a professional social media manager. 
    Write a creative and engaging caption about: "${topic}".
    
    Context: ${platformContext}
    
    Requirements:
    - Language: Portuguese (Brazil)
    - Tone: Professional yet friendly
    - Include 3-5 relevant hashtags at the end
    - Use emojis appropriately
    - concise (under 200 words)
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
            temperature: 0.7,
        });

        return response.choices[0]?.message?.content?.trim() || 'Não foi possível gerar a legenda.';
    } catch (error: any) {
        console.error('OpenAI Error:', error);
        throw new Error(`Failed to generate caption: ${error.message}`);
    }
};
