#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
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

async function cleanupTestData() {
  try {
    console.log("🧹 Test Data Cleanup Tool");
    console.log(`=${"=".repeat(50)}`);
    console.log("⚠️  WARNING: This will permanently delete test data!");
    console.log(`=${"=".repeat(50)}\n`);

    // Check if we're in production
    if (process.env.NODE_ENV === "production") {
      console.error("❌ Cannot run cleanup in production environment!");
      process.exit(1);
    }

    // Define test data patterns
    const testPatterns = {
      emails: ["test@", "@example.com", "@test."],
      names: ["Test User", "Demo User", "Example User"],
      companies: ["Test Company", "Demo Company", "Example Company"],
    };

    // Find test users
    console.log("🔍 Searching for test data...\n");

    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: "test@" } },
          { email: { contains: "@example.com" } },
          { email: { contains: "@test." } },
          { name: { in: testPatterns.names } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (testUsers.length === 0) {
      console.log("✅ No test data found!");
      process.exit(0);
    }

    console.log(`Found ${testUsers.length} test user(s):`);
    console.log("-".repeat(50));

    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString("nl-NL")}`);
    });

    console.log(`\n${"-".repeat(50)}`);

    // Ask for confirmation
    const answer = await askQuestion(
      "\n⚠️  Do you want to delete these test users and all related data? (yes/no): ",
    );

    if (answer.toLowerCase() !== "yes") {
      console.log("❌ Cleanup cancelled");
      process.exit(0);
    }

    // Double confirmation for safety
    const confirmAnswer = await askQuestion(
      "Type 'DELETE' to confirm deletion: ",
    );

    if (confirmAnswer !== "DELETE") {
      console.log("❌ Cleanup cancelled");
      process.exit(0);
    }

    console.log("\n🗑️  Deleting test data...");

    // Delete test users and cascade will handle related data
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: {
          in: testUsers.map((u) => u.id),
        },
      },
    });

    console.log(`\n✅ Successfully deleted ${deleteResult.count} test user(s)`);

    // Clean up orphaned data
    console.log("\n🧹 Cleaning up orphaned data...");

    // Clean up old security logs (older than 30 days)
    const oldLogs = await prisma.securityLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (oldLogs.count > 0) {
      console.log(`  - Deleted ${oldLogs.count} old security logs`);
    }

    // Clean up expired verification tokens
    const expiredTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    if (expiredTokens.count > 0) {
      console.log(
        `  - Deleted ${expiredTokens.count} expired verification tokens`,
      );
    }

    // Clean up expired password reset tokens
    const expiredResetTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    if (expiredResetTokens.count > 0) {
      console.log(
        `  - Deleted ${expiredResetTokens.count} expired password reset tokens`,
      );
    }

    console.log("\n✅ Cleanup completed successfully!");

    // Generate summary
    console.log("\n📊 Cleanup Summary:");
    console.log("-".repeat(30));
    console.log(`Test Users Deleted: ${deleteResult.count}`);
    console.log(`Old Security Logs: ${oldLogs.count}`);
    console.log(
      `Expired Tokens: ${expiredTokens.count + expiredResetTokens.count}`,
    );
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

cleanupTestData();
