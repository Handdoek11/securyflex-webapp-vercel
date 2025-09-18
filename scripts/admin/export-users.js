#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs");
const path = require("node:path");
const prisma = new PrismaClient();

async function exportUsers() {
  try {
    console.log("📊 Exporting users to CSV...");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        emailVerified: true,
        phone: true,
        zzpProfile: {
          select: {
            kvkNummer: true,
            specialisaties: true,
          },
        },
        bedrijfProfile: {
          select: {
            bedrijfsnaam: true,
            kvkNummer: true,
          },
        },
        opdrachtgever: {
          select: {
            bedrijfsnaam: true,
            kvkNummer: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Create CSV header
    const headers = [
      "ID",
      "Email",
      "Name",
      "Phone",
      "Role",
      "Status",
      "Email Verified",
      "Company/Business Name",
      "KVK Number",
      "Specializations",
      "Created Date",
    ];

    // Create CSV rows
    const rows = users.map((user) => {
      let companyName = "";
      let kvkNumber = "";
      let specializations = "";

      if (user.role === "ZZP_BEVEILIGER" && user.zzpProfile) {
        kvkNumber = user.zzpProfile.kvkNummer || "";
        specializations = user.zzpProfile.specialisaties?.join("; ") || "";
      } else if (user.role === "BEDRIJF" && user.bedrijfProfile) {
        companyName = user.bedrijfProfile.bedrijfsnaam || "";
        kvkNumber = user.bedrijfProfile.kvkNummer || "";
      } else if (user.role === "OPDRACHTGEVER" && user.opdrachtgever) {
        companyName = user.opdrachtgever.bedrijfsnaam || "";
        kvkNumber = user.opdrachtgever.kvkNummer || "";
      }

      return [
        user.id,
        user.email,
        user.name,
        user.phone || "",
        user.role,
        user.status,
        user.emailVerified ? "Yes" : "No",
        companyName,
        kvkNumber,
        specializations,
        user.createdAt.toLocaleDateString("nl-NL"),
      ];
    });

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    // Save to file
    const fileName = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    const filePath = path.join(process.cwd(), "exports", fileName);

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, csvContent, "utf8");

    console.log(`✅ Successfully exported ${users.length} users`);
    console.log(`📁 File saved to: ${filePath}`);

    // Print summary statistics
    console.log("\n📈 Export Summary:");
    console.log("-".repeat(30));

    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });

    const statusCounts = users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {});

    console.log("\nBy Status:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
  } catch (error) {
    console.error("❌ Error exporting users:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportUsers();
