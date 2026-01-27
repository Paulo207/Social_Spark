
import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database');
        const userCount = await prisma.account.count();
        console.log(`Found ${userCount} accounts`);
    } catch (e) {
        console.error('Connection failed', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
