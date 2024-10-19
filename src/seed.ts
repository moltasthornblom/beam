// src/seed.ts
import User from './models/userModel';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  const defaultUsername = process.env.DEFAULT_USERNAME;
  const defaultPassword = process.env.DEFAULT_PASSWORD;

  // Check if there are any users at all
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const hashedPassword = bcrypt.hashSync(defaultPassword!, 10);
    const user = new User({
      username: defaultUsername,
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    });
    await user.save();
    console.log('Default user created');
  } else {
    console.log('Users already exist in the database');
  }
}

export default seedDatabase;
