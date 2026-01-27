
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const mainSubjects = await prisma.mainSubject.findMany();
    console.log(JSON.stringify(mainSubjects, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
