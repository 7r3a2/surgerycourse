import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting password migration...');
    const users = await prisma.user.findMany();

    let updatedCount = 0;

    for (const user of users) {
        // Simple check: if password doesn't look like a bcrypt hash (starts with $2), hash it
        // A typical bcrypt hash is 60 chars long and starts with $2a$ or $2b$
        if (!user.password.startsWith('$2') || user.password.length < 50) {
            console.log(`Hashing password for user: ${user.username}`);
            const hashedPassword = await bcrypt.hash(user.password, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
            updatedCount++;
        }
    }

    console.log(`Migration complete. Updated ${updatedCount} users.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
