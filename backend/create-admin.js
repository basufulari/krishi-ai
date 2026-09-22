import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishiapp';
const adminPhone = process.argv[2] || '9999999999';
const adminName = process.argv[3] || 'DB Administrator';
const adminPin = process.argv[4] || '1234';

async function createOrPromoteAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB...');

    let user = await User.findOne({ phone: adminPhone });
    const hashedPin = await bcrypt.hash(adminPin, 8);

    if (user) {
      user.role = 'admin';
      user.pin = hashedPin;
      await user.save();
      console.log(`\n✅ Existing user ${adminPhone} (${user.name}) has been PROMOTED to Admin with PIN: ${adminPin}\n`);
    } else {
      user = new User({
        phone: adminPhone,
        name: adminName,
        pin: hashedPin,
        role: 'admin',
      });
      await user.save();
      console.log(`\n✅ Created NEW Admin account successfully!`);
      console.log(`   Phone (Username): ${adminPhone}`);
      console.log(`   PIN: ${adminPin}`);
      console.log(`   Name: ${adminName}\n`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
    process.exit(1);
  }
}

createOrPromoteAdmin();
