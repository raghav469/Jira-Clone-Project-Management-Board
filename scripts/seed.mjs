import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve .env.local path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function seed() {
    console.log('Connecting to DB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Dynamic import to avoid alias issues if valid, or just relative import
    const UserRaw = await import('../models/User.js');
    const User = UserRaw.default;

    console.log('Clearing users...');
    await User.deleteMany({});

    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.create([
        {
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
        },
        {
            name: 'Regular User',
            email: 'user@example.com',
            password: hashedPassword,
            role: 'member',
        },
    ]);

    console.log('Users seeded:', users.length);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
