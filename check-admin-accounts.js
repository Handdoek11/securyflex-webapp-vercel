const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAdminAccounts() {
  try {
    console.log("🔍 Checking admin account status...\n");

    // Check if admin accounts exist
    const adminEmails = ["stef@securyflex.com", "robert@securyflex.com"];

    for (const email of adminEmails) {
      console.log(`📧 Checking ${email}:`);

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          emailVerified: true,
          failedLoginAttempts: true,
          lastFailedLogin: true,
          lockedUntil: true,
          createdAt: true,
        },
      });

      if (!user) {
        console.log(`   ❌ User does NOT exist\n`);
        continue;
      }

      console.log(`   ✅ User exists`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(
        `   Email Verified: ${user.emailVerified ? "✅ Yes" : "❌ No"}`,
      );
      console.log(`   Failed Login Attempts: ${user.failedLoginAttempts}`);
      console.log(`   Last Failed Login: ${user.lastFailedLogin || "None"}`);
      console.log(`   Locked Until: ${user.lockedUntil || "Not locked"}`);
      console.log(`   Created: ${user.createdAt}`);

      // Check if account is currently locked
      const isLocked =
        user.lockedUntil && new Date(user.lockedUntil) > new Date();
      console.log(`   🔒 Currently Locked: ${isLocked ? "❌ YES" : "✅ No"}`);

      console.log("");
    }

    // Check recent security logs for admin login attempts
    console.log("📋 Recent security logs for admin accounts:\n");

    const recentLogs = await prisma.securityLog.findMany({
      where: {
        email: {
          in: adminEmails,
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (recentLogs.length === 0) {
      console.log("   No recent login attempts found");
    } else {
      recentLogs.forEach((log) => {
        console.log(`   ${log.createdAt} - ${log.email} - ${log.eventType}`);
      });
    }

    console.log("\n🎯 Summary:");
    const stefExists = await prisma.user.findUnique({
      where: { email: "stef@securyflex.com" },
    });
    const robertExists = await prisma.user.findUnique({
      where: { email: "robert@securyflex.com" },
    });

    console.log(`   Stef account: ${stefExists ? "✅ Exists" : "❌ Missing"}`);
    console.log(
      `   Robert account: ${robertExists ? "✅ Exists" : "❌ Missing"}`,
    );
  } catch (error) {
    console.error("❌ Error checking admin accounts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminAccounts();
