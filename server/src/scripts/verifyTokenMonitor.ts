
import { PrismaClient } from '@prisma/client';
import { TokenMonitorService } from '../services/tokenMonitor'; // Adjust import path if needed

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING VERIFICATION ---');

    // 1. Create Test Data
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

    const expiringSoonDate = new Date();
    expiringSoonDate.setHours(expiringSoonDate.getHours() + 24); // Tomorrow

    console.log('Creating test accounts...');

    const expiredAccount = await prisma.account.create({
        data: {
            platform: 'instagram',
            username: 'test_expired_user',
            profileImage: 'http://example.com/img.jpg',
            isConnected: true,
            followers: 100,
            accessToken: 'expired_token',
            originalResponse: '{}',
            tokenExpiresAt: expiredDate
        }
    });

    const expiringSoonAccount = await prisma.account.create({
        data: {
            platform: 'facebook',
            username: 'test_soon_user',
            profileImage: 'http://example.com/img.jpg',
            isConnected: true,
            followers: 200,
            accessToken: 'soon_token',
            originalResponse: '{}',
            tokenExpiresAt: expiringSoonDate
        }
    });

    console.log(`Created accounts: ${expiredAccount.id} (expired), ${expiringSoonAccount.id} (soon)`);

    // 2. Run Monitor
    console.log('\n--- RUNNING MONITOR CHECK ---');
    await TokenMonitorService.checkTokenExpirations();

    // 3. Verify Results
    console.log('\n--- VERIFYING RESULTS ---');
    const updatedExpired = await prisma.account.findUnique({ where: { id: expiredAccount.id } });
    const updatedSoon = await prisma.account.findUnique({ where: { id: expiringSoonAccount.id } });

    if (updatedExpired && updatedExpired.isConnected === false) {
        console.log('✅ SUCCESS: Expired account was disconnected.');
    } else {
        console.error('❌ FAILURE: Expired account was NOT disconnected.');
    }

    if (updatedSoon && updatedSoon.isConnected === true) {
        console.log('✅ SUCCESS: Expiring soon account remained connected.');
    } else {
        console.error('❌ FAILURE: Expiring soon account was unexpectedly disconnected.');
    }

    // 3. Cleanup
    console.log('\n--- CLEANING UP ---');
    await prisma.account.deleteMany({
        where: {
            id: {
                in: [expiredAccount.id, expiringSoonAccount.id]
            }
        }
    });
    console.log('Cleanup complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
