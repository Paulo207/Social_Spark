
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import fetch from 'node-fetch';

dotenv.config();

async function checkOpenAI() {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return { name: 'OpenAI', status: 'SKIPPED', msg: 'No Key' };

    try {
        const openai = new OpenAI({ apiKey: key });
        await openai.models.list();
        return { name: 'OpenAI', status: '✅ VALID' };
    } catch (e: any) {
        return { name: 'OpenAI', status: '❌ INVALID', msg: e.message?.split('\n')[0] };
    }
}

async function checkGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return { name: 'Gemini', status: 'SKIPPED', msg: 'No Key' };

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        await model.generateContent("Hi");
        return { name: 'Gemini', status: '✅ VALID' };
    } catch (e: any) {
        return { name: 'Gemini', status: '❌ INVALID', msg: e.message?.split('\n')[0] };
    }
}

async function checkAnthropic() {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return { name: 'Anthropic', status: 'SKIPPED', msg: 'No Key' };

    try {
        const anthropic = new Anthropic({ apiKey: key });
        await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 10,
            messages: [{ role: "user", content: "Hi" }]
        });
        return { name: 'Anthropic', status: '✅ VALID' };
    } catch (e: any) {
        return { name: 'Anthropic', status: '❌ INVALID', msg: e.message?.split('\n')[0] };
    }
}

async function checkPerplexity() {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) return { name: 'Perplexity', status: 'SKIPPED', msg: 'No Key' };

    try {
        const res = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-chat',
                messages: [{ role: 'user', content: 'Hi' }]
            })
        });
        if (!res.ok) throw new Error(await res.text());
        return { name: 'Perplexity', status: '✅ VALID' };
    } catch (e: any) {
        return { name: 'Perplexity', status: '❌ INVALID', msg: e.message?.split('\n')[0] };
    }
}

async function checkOpenRouter() {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return { name: 'OpenRouter', status: 'SKIPPED', msg: 'No Key' };

    try {
        const openai = new OpenAI({
            apiKey: key,
            baseURL: "https://openrouter.ai/api/v1",
        });
        await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo", // Usually free or cheap
            messages: [{ role: "user", content: "Hi" }],
        });
        return { name: 'OpenRouter', status: '✅ VALID' };
    } catch (e: any) {
        return { name: 'OpenRouter', status: '❌ INVALID', msg: e.message?.split('\n')[0] };
    }
}

async function main() {
    console.log('--- Checking API Keys ---');
    const results = await Promise.all([
        checkOpenAI(),
        checkGemini(),
        checkAnthropic(),
        checkPerplexity(),
        checkOpenRouter()
    ]);

    results.forEach(r => {
        console.log(`${r.name}: ${r.status} ${r.msg ? `(${r.msg})` : ''}`);
    });
    console.log('-------------------------');
}

main();
