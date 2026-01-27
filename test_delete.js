
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const all = await prisma.mainSubject.findMany();
    if (all.length > 0) {
        const id = all[0].id;
        console.log(`Attempting to delete MainSubject with id: ${id}`);
        const result = await prisma.mainSubject.delete({
            where: { id: id }
        });
        console.log('Deleted successfully:', result);
    } else {
        console.log('No MainSubjects to delete');
    }
}

main()
    .catch(e => {
        console.error('Error during deletion:', e);
    })
    .finally(async () => await prisma.$disconnect());
