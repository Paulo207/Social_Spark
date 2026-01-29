
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

// Analyze image using GPT-4 Vision
export const analyzeImage = async (imageUrl: string): Promise<any> => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analyze this image and provide detailed information about:
                            1. Main subject/content
                            2. Colors and mood
                            3. Setting/location (if identifiable)
                            4. Activities or actions
                            5. Suggested themes or topics
                            
                            Respond in JSON format with keys: subject, colors, mood, setting, activities, themes`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) throw new Error('No analysis returned');

        // Try to parse as JSON, fallback to text
        try {
            return JSON.parse(content);
        } catch {
            return { analysis: content };
        }
    } catch (error: any) {
        console.error('Image Analysis Error:', error);
        throw new Error(`Failed to analyze image: ${error.message}`);
    }
};

// Generate caption from image
export const generateCaptionFromImage = async (
    imageUrl: string,
    platform: 'instagram' | 'facebook' | 'both' = 'both'
): Promise<string> => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    const platformContext = platform === 'instagram'
        ? 'Focus on visual storytelling, use proper hashtags, and keep it engaging for Instagram.'
        : platform === 'facebook'
            ? 'Focus on community engagement, slightly longer form if needed, for Facebook.'
            : 'Create a versatile caption suitable for both Instagram and Facebook.';

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `You are a professional social media manager. 
                            Analyze this image and write a creative and engaging caption.
                            
                            Context: ${platformContext}
                            
                            Requirements:
                            - Language: Portuguese (Brazil)
                            - Tone: Professional yet friendly
                            - Include 3-5 relevant hashtags at the end
                            - Use emojis appropriately
                            - Concise (under 200 words)
                            - Base the caption on what you see in the image`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300,
            temperature: 0.7,
        });

        return response.choices[0]?.message?.content?.trim() || 'Não foi possível gerar a legenda.';
    } catch (error: any) {
        console.error('Caption Generation Error:', error);
        throw new Error(`Failed to generate caption from image: ${error.message}`);
    }
};

// Generate hashtags based on content
export const generateHashtags = async (
    caption: string,
    imageAnalysis?: string
): Promise<string[]> => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    const context = imageAnalysis
        ? `Caption: ${caption}\n\nImage Analysis: ${imageAnalysis}`
        : `Caption: ${caption}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `Based on the following content, suggest 8-12 relevant hashtags in Portuguese (Brazil).
                    
                    ${context}
                    
                    Requirements:
                    - Mix of popular and niche hashtags
                    - Relevant to Brazilian audience
                    - Include branded and general hashtags
                    - Return ONLY the hashtags, one per line, with # symbol
                    - No explanations or additional text`
                }
            ],
            max_tokens: 200,
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content?.trim() || '';
        const hashtags = content
            .split('\n')
            .map(tag => tag.trim())
            .filter(tag => tag.startsWith('#'))
            .slice(0, 12);

        return hashtags;
    } catch (error: any) {
        console.error('Hashtag Generation Error:', error);
        throw new Error(`Failed to generate hashtags: ${error.message}`);
    }
};

// Combined function to generate all metadata for a media asset
export const generateMediaMetadata = async (
    imageUrl: string,
    platform: 'instagram' | 'facebook' | 'both' = 'both'
): Promise<{
    caption: string;
    hashtags: string[];
    analysis: any;
}> => {
    try {
        // Run analysis and caption generation in parallel
        const [analysis, caption] = await Promise.all([
            analyzeImage(imageUrl),
            generateCaptionFromImage(imageUrl, platform)
        ]);

        // Generate hashtags based on caption and analysis
        const analysisText = typeof analysis === 'string'
            ? analysis
            : JSON.stringify(analysis);
        const hashtags = await generateHashtags(caption, analysisText);

        return {
            caption,
            hashtags,
            analysis
        };
    } catch (error: any) {
        console.error('Metadata Generation Error:', error);
        throw new Error(`Failed to generate media metadata: ${error.message}`);
    }
};
