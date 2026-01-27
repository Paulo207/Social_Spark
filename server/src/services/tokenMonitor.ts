import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TokenMonitorService {
    private static checkInterval: NodeJS.Timeout | null = null;
    private static readonly CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
    private static readonly WARNING_THRESHOLD_HOURS = 48;

    /**
     * Starts the background monitoring process
     */
    static startMonitoring() {
        if (this.checkInterval) {
            console.log('Token monitoring is already running.');
            return;
        }

        console.log('Starting token expiration monitoring...');

        // Run immediately on startup
        this.checkTokenExpirations().catch(console.error);

        // Schedule periodic checks
        this.checkInterval = setInterval(() => {
            this.checkTokenExpirations().catch(console.error);
        }, this.CHECK_INTERVAL_MS);
    }

    /**
     * Stops the background monitoring process
     */
    static stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('Token monitoring stopped.');
        }
    }

    /**
     * Checks for expired or soon-to-expire tokens
     */
    static async checkTokenExpirations() {
        console.log(`[${new Date().toISOString()}] Running token expiration check...`);

        try {
            const now = new Date();
            const warningThreshold = new Date(now.getTime() + this.WARNING_THRESHOLD_HOURS * 60 * 60 * 1000);

            // 1. Check for tokens that are ALREADY expired
            const expiredAccounts = await prisma.account.findMany({
                where: {
                    isConnected: true,
                    tokenExpiresAt: {
                        lt: now,
                    },
                },
            });

            if (expiredAccounts.length > 0) {
                console.warn(`FOUND ${expiredAccounts.length} EXPIRED TOKENS. Disconnecting accounts...`);

                for (const account of expiredAccounts) {
                    console.warn(`- Account: ${account.username} (${account.platform}) - Expired at: ${account.tokenExpiresAt}`);

                    // Mark as disconnected
                    await prisma.account.update({
                        where: { id: account.id },
                        data: { isConnected: false }
                    });

                    // TODO: Implement notification logic here (e.g., email, in-app notification)
                }
            }

            // 2. Check for tokens expiring SOON (within 48 hours)
            const expiringSoonAccounts = await prisma.account.findMany({
                where: {
                    isConnected: true,
                    tokenExpiresAt: {
                        gt: now,
                        lt: warningThreshold,
                    },
                },
            });

            if (expiringSoonAccounts.length > 0) {
                console.info(`FOUND ${expiringSoonAccounts.length} TOKENS EXPIRING SOON (< ${this.WARNING_THRESHOLD_HOURS}h):`);
                expiringSoonAccounts.forEach(account => {
                    console.info(`- Account: ${account.username} (${account.platform}) - Expires at: ${account.tokenExpiresAt}`);
                    // TODO: Implement notification logic here
                });
            }

            if (expiredAccounts.length === 0 && expiringSoonAccounts.length === 0) {
                console.log('Token check complete. No issues found.');
            }

        } catch (error) {
            console.error('Error during token expiration check:', error);
        }
    }
}
