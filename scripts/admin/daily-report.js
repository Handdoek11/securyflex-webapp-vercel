#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function generateDailyReport() {
  try {
    console.log("📊 Generating Daily Admin Report");
    console.log(`=${"=".repeat(50)}`);
    console.log(`Date: ${new Date().toLocaleDateString("nl-NL")}`);
    console.log(`=${"=".repeat(50)}\n`);

    // User Statistics
    console.log("👥 USER STATISTICS");
    console.log("-".repeat(30));

    const userStats = await prisma.user.groupBy({
      by: ["role", "status"],
      _count: true,
    });

    const totalUsers = await prisma.user.count();
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    console.log(`Total Users: ${totalUsers}`);
    console.log(`New Users Today: ${newUsersToday}`);
    console.log("\nBy Role & Status:");

    userStats.forEach((stat) => {
      console.log(`  ${stat.role} (${stat.status}): ${stat._count}`);
    });

    // Locked Accounts
    const lockedAccounts = await prisma.user.findMany({
      where: {
        lockedUntil: {
          gt: new Date(),
        },
      },
      select: {
        email: true,
        lockedUntil: true,
        failedLoginAttempts: true,
      },
    });

    console.log(`\n🔒 LOCKED ACCOUNTS: ${lockedAccounts.length}`);
    if (lockedAccounts.length > 0) {
      console.log("-".repeat(30));
      lockedAccounts.forEach((acc) => {
        console.log(`  - ${acc.email}`);
        console.log(`    Failed Attempts: ${acc.failedLoginAttempts}`);
        console.log(
          `    Locked Until: ${acc.lockedUntil.toLocaleString("nl-NL")}`,
        );
      });
    }

    // Opdracht Statistics
    console.log("\n📋 OPDRACHT STATISTICS");
    console.log("-".repeat(30));

    const opdrachtStats = await prisma.opdracht.groupBy({
      by: ["status"],
      _count: true,
    });

    const todaysOpdrachten = await prisma.opdracht.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    console.log(`New Opdrachten Today: ${todaysOpdrachten}`);
    console.log("\nBy Status:");
    opdrachtStats.forEach((stat) => {
      console.log(`  ${stat.status}: ${stat._count}`);
    });

    // Recent Security Events
    console.log("\n🔐 RECENT SECURITY EVENTS (Last 24h)");
    console.log("-".repeat(30));

    const securityEvents = await prisma.securityLog.groupBy({
      by: ["eventType"],
      _count: true,
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (securityEvents.length === 0) {
      console.log("  No security events in the last 24 hours");
    } else {
      securityEvents.forEach((event) => {
        console.log(`  ${event.eventType}: ${event._count}`);
      });
    }

    // Financial Summary
    console.log("\n💰 FINANCIAL SUMMARY");
    console.log("-".repeat(30));

    const monthlyRevenue = await prisma.verzamelFactuur.aggregate({
      _sum: {
        totaalBedrag: true,
      },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
        status: {
          in: ["PAID", "PENDING"],
        },
      },
    });

    const pendingPayments = await prisma.verzamelFactuur.count({
      where: {
        status: "PENDING",
      },
    });

    console.log(
      `Monthly Revenue: €${(monthlyRevenue._sum.totaalBedrag || 0).toLocaleString("nl-NL")}`,
    );
    console.log(`Pending Payments: ${pendingPayments}`);

    // System Health
    console.log("\n⚡ SYSTEM HEALTH");
    console.log("-".repeat(30));

    const failedLogins24h = await prisma.securityLog.count({
      where: {
        eventType: "LOGIN_FAILED",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    console.log(`Failed Login Attempts (24h): ${failedLogins24h}`);

    // Check for pending document verifications
    const pendingDocs = await prisma.documentVerificatie.count({
      where: {
        status: "PENDING",
      },
    });

    console.log(`Pending Document Verifications: ${pendingDocs}`);

    console.log(`\n${"=".repeat(51)}`);
    console.log("Report generated successfully!");
  } catch (error) {
    console.error("❌ Error generating report:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

generateDailyReport();
