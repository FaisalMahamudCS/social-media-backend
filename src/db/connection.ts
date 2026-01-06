import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initDatabase = async () => {
    try {
        // Prisma will handle migrations, but we can verify connection
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
};

export default prisma;
