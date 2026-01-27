const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Diagnostic: Testing Write ---');
    try {
        const subjects = await prisma.subject.findMany({ take: 1 });
        if (subjects.length === 0) {
            console.log('No subjects found to test update.');
            return;
        }
        const target = subjects[0];
        console.log('Testing update on subject:', target.id);
        await prisma.subject.update({
            where: { id: target.id },
            data: { updatedAt: new Date() }
        });
        console.log('Update successful!');
    } catch (e) {
        console.error('Update FAILED:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
