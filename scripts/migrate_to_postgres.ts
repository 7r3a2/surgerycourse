import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize Prisma Client (connected to Postgres via .env)
const prisma = new PrismaClient();

// Initialize SQLite connection (reading local file)
const sqlitePath = path.resolve(process.cwd(), 'migration_temp.db');
let db: any;
try {
    db = new Database(sqlitePath);
    console.log('SQLite database opened successfully.');
} catch (e) {
    console.error('Failed to open SQLite database:', e);
    process.exit(1);
}

async function main() {
    console.log('Starting migration from SQLite to Postgres...');
    console.log(`Reading from: ${sqlitePath}`);

    // --- Migrate Users ---
    const users = db.prepare('SELECT * FROM users').all() as any[];
    console.log(`Found ${users.length} users to migrate.`);
    for (const user of users) {
        // Convert integer booleans to actual booleans if needed (sqlite stores 0/1)
        // Check if user already exists
        const exists = await prisma.user.findUnique({ where: { id: user.id } });
        if (!exists) {
            await prisma.user.create({
                data: {
                    id: user.id,
                    username: user.username,
                    password: user.password,
                    isAdmin: !!user.isAdmin,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt)
                }
            });
        }
    }

    // --- Migrate Main Subjects ---
    const mainSubjects = db.prepare('SELECT * FROM main_subjects').all() as any[];
    console.log(`Found ${mainSubjects.length} main subjects.`);
    for (const ms of mainSubjects) {
        await prisma.mainSubject.upsert({
            where: { id: ms.id },
            update: {},
            create: {
                id: ms.id,
                title: ms.title,
                description: ms.description,
                color: ms.color,
                order: ms.order,
                createdAt: new Date(ms.createdAt),
                updatedAt: new Date(ms.updatedAt)
            }
        });
    }

    // --- Migrate Subjects ---
    const subjects = db.prepare('SELECT * FROM subjects').all() as any[];
    console.log(`Found ${subjects.length} subjects.`);
    for (const s of subjects) {
        await prisma.subject.upsert({
            where: { id: s.id },
            update: {},
            create: {
                id: s.id,
                mainSubjectId: s.mainSubjectId,
                title: s.title,
                description: s.description,
                color: s.color,
                order: s.order,
                createdAt: new Date(s.createdAt),
                updatedAt: new Date(s.updatedAt)
            }
        });
    }

    // --- Migrate Topics ---
    const topics = db.prepare('SELECT * FROM topics').all() as any[];
    console.log(`Found ${topics.length} topics.`);
    for (const t of topics) {
        await prisma.topic.upsert({
            where: { id: t.id },
            update: {},
            create: {
                id: t.id,
                subjectId: t.subjectId,
                title: t.title,
                dueDate: t.dueDate ? new Date(t.dueDate) : null,
                order: t.order,
                createdAt: new Date(t.createdAt),
                updatedAt: new Date(t.updatedAt)
            }
        });
    }

    // --- Migrate Completions ---
    const completions = db.prepare('SELECT * FROM topic_completions').all() as any[];
    console.log(`Found ${completions.length} completions.`);
    for (const c of completions) {
        await prisma.topicCompletion.upsert({
            where: { userId_topicId: { userId: c.userId, topicId: c.topicId } },
            update: {},
            create: {
                id: c.id,
                userId: c.userId,
                topicId: c.topicId,
                completed: !!c.completed,
                createdAt: new Date(c.createdAt)
            }
        });
    }

    // --- Migrate Calendar Tasks ---
    // Check if table exists first (handling legacy sqlite dbs)
    try {
        const tasks = db.prepare('SELECT * FROM calendar_tasks').all() as any[];
        console.log(`Found ${tasks.length} calendar tasks.`);
        for (const t of tasks) {
            await prisma.calendarTask.createMany({
                data: {
                    id: t.id,
                    userId: t.userId,
                    title: t.title,
                    date: new Date(t.date),
                    completed: !!t.completed,
                    createdAt: new Date(t.createdAt)
                },
                skipDuplicates: true
            });
        }
    } catch (e) { console.log('Skipping calendar_tasks (table not found)'); }

    // --- Migrate Study Plans ---
    try {
        const plans = db.prepare('SELECT * FROM study_plans').all() as any[];
        console.log(`Found ${plans.length} study plans.`);
        for (const p of plans) {
            await prisma.studyPlan.createMany({
                data: {
                    id: p.id,
                    userId: p.userId,
                    name: p.name,
                    startDate: new Date(p.startDate),
                    endDate: new Date(p.endDate),
                    createdAt: new Date(p.createdAt)
                },
                skipDuplicates: true
            });
        }
    } catch (e) { console.log('Skipping study_plans'); }

    // --- Migrate Scheduled Topics ---
    try {
        const sched = db.prepare('SELECT * FROM scheduled_topics').all() as any[];
        console.log(`Found ${sched.length} scheduled topics.`);
        for (const s of sched) {
            await prisma.scheduledTopic.createMany({
                data: {
                    id: s.id,
                    studyPlanId: s.studyPlanId,
                    topicId: s.topicId,
                    scheduledDate: new Date(s.scheduledDate),
                    completed: !!s.completed,
                    topicTitle: s.topicTitle,
                    subjectId: s.subjectId,
                    subjectTitle: s.subjectTitle,
                    mainSubjectId: s.mainSubjectId,
                    mainSubjectTitle: s.mainSubjectTitle,
                    subjectColor: s.subjectColor
                },
                skipDuplicates: true
            });
        }
    } catch (e) { console.log('Skipping scheduled_topics'); }

    console.log('Migration completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        db.close();
    });
