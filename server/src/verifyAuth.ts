
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api';

async function main() {
    console.log('--- Starting Auth Verification ---');

    // 1. Test Unprotected Access (Should Fail)
    console.log('\n1. Testing Unprotected Access to /api/posts...');
    const res1 = await fetch(`${API_URL}/posts`);
    if (res1.status === 401) {
        console.log('✅ Success: Got 401 Unauthorized as expected.');
    } else {
        console.error(`❌ Failed: Expected 401, got ${res1.status}`);
    }

    // 2. Setup Test User
    console.log('\n2. Setting up Test User...');
    const email = 'testuser@example.com';
    const password = 'password123';
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('Creating test user...');
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
            data: {
                name: 'Test User',
                email,
                password: hashedPassword,
                role: 'user'
            }
        });
    } else {
        console.log('Test user already exists.');
    }

    // 3. Login to get Token
    console.log('\n3. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password })
    });

    if (!loginRes.ok) {
        console.error('❌ Login failed:', await loginRes.text());
        return;
    }

    const loginData = await loginRes.json() as any;
    const token = loginData.token;
    console.log('✅ Login successful. Token received.');

    // 4. Test Protected Access (Should Success)
    console.log('\n4. Testing Protected Access to /api/posts with Token...');
    const res2 = await fetch(`${API_URL}/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res2.status === 200) {
        console.log('✅ Success: Got 200 OK with valid token.');
        const posts = await res2.json();
        console.log(`   Retrieved ${Array.isArray(posts) ? posts.length : 0} posts.`);
    } else {
        console.error(`❌ Failed: Expected 200, got ${res2.status}`);
        console.error(await res2.text());
    }

    // Cleanup (optional, maybe keep for manual testing)
    // await prisma.user.delete({ where: { email } });
    console.log('\n--- Verification Complete ---');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
