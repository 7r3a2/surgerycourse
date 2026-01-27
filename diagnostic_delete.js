
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const id = process.argv[2];
    if (!id) {
        console.error('Please provide an id');
        return;
    }
    console.log(`Diagnostic delete for ID: ${id}`);
    try {
        const result = await prisma.mainSubject.delete({
            where: { id: id }
        });
        console.log('Delete successful:', result);
    } catch (error) {
        console.error('Delete failed with error:', error);
    }
}

main().finally(async () => await prisma.$disconnect());
