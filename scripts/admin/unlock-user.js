#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function unlockUser() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Usage: node scripts/admin/unlock-user.js <email>");
    process.exit(1);
  }

  try {
    console.log(`🔓 Unlocking user account: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Check if account is locked
    if (!user.lockedUntil || new Date(user.lockedUntil) <= new Date()) {
      console.log(`✅ Account ${email} is not locked`);
      process.exit(0);
    }

    // Unlock the account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lockedUntil: null,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
      },
    });

    // Log the action
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        email: user.email,
        eventType: "ACCOUNT_UNLOCKED",
        metadata: {
          unlockedBy: "admin_script",
          unlockedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`✅ Successfully unlocked account: ${email}`);
    console.log(`   - Reset failed login attempts: 0`);
    console.log(`   - Cleared lock timestamp`);
  } catch (error) {
    console.error("❌ Error unlocking user:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

unlockUser();
