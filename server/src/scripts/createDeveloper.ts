
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'andreairesw@gmail.com';
    const password = '051051051';
    const name = 'Developer Admin'; // Default name

    console.log(`Configuring developer account for ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'developer',
        },
        create: {
            email,
            password: hashedPassword,
            name,
            role: 'developer',
        },
    });

    console.log(`User ${user.email} configured successfully with role: ${user.role}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
