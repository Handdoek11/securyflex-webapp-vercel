#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const readline = require("node:readline");
const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function generateSecurePassword(length = 12) {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const all = uppercase + lowercase + numbers + special;

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

async function resetUserPassword() {
  try {
    console.log("🔐 User Password Reset Tool");
    console.log(`=${"=".repeat(50)}\n`);

    const email = process.argv[2];

    if (!email) {
      console.error(
        "❌ Usage: node scripts/admin/reset-user-password.js <email>",
      );
      process.exit(1);
    }

    // Find user
    console.log(`🔍 Looking up user: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Display user info
    console.log("\n📋 User Information:");
    console.log("-".repeat(30));
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Status: ${user.status}`);

    // Ask for confirmation
    const answer = await askQuestion(
      "\n⚠️  Do you want to reset this user's password? (yes/no): ",
    );

    if (answer.toLowerCase() !== "yes") {
      console.log("❌ Password reset cancelled");
      process.exit(0);
    }

    // Ask if they want a custom password or auto-generated
    const customAnswer = await askQuestion(
      "Do you want to set a custom password? (yes/no, default: no): ",
    );

    let newPassword;
    if (customAnswer.toLowerCase() === "yes") {
      newPassword = await askQuestion(
        "Enter new password (min 8 characters): ",
      );

      if (newPassword.length < 8) {
        console.error("❌ Password must be at least 8 characters long");
        process.exit(1);
      }
    } else {
      newPassword = generateSecurePassword();
      console.log("\n🎲 Generated secure password");
    }

    // Hash the password
    console.log("🔄 Hashing password...");
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Log the password reset
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        email: user.email,
        eventType: "PASSWORD_RESET_COMPLETED",
        metadata: {
          resetBy: "admin_script",
          method: "manual_reset",
          resetAt: new Date().toISOString(),
        },
      },
    });

    console.log("\n✅ Password reset successful!");
    console.log(`=${"=".repeat(50)}`);
    console.log("\n📋 NEW PASSWORD INFORMATION:");
    console.log("-".repeat(30));
    console.log(`  User: ${user.email}`);
    console.log(`  New Password: ${newPassword}`);
    console.log("-".repeat(30));
    console.log("\n⚠️  IMPORTANT:");
    console.log("  1. Share this password securely with the user");
    console.log("  2. Advise them to change it after first login");
    console.log("  3. Do not share via unencrypted email");
    console.log("\n✅ Account has been unlocked if it was locked");
  } catch (error) {
    console.error("❌ Error resetting password:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

resetUserPassword();
