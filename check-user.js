const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkUser() {
  try {
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: {
        email: "svdweijden92@gmail.com",
      },
      include: {
        zzpProfile: true,
        bedrijfProfile: true,
        opdrachtgever: true,
      },
    });

    if (user) {
      console.log("User found in database:");
      console.log("- ID:", user.id);
      console.log("- Name:", user.name);
      console.log("- Role:", user.role);
      console.log("- Status:", user.status);
      console.log("- Email Verified:", user.emailVerified);
      console.log("- Created:", user.createdAt);

      if (user.zzpProfile) {
        console.log("- Has ZZP Profile: Yes");
      }
      if (user.bedrijfProfile) {
        console.log("- Has Bedrijf Profile: Yes");
      }
      if (user.opdrachtgever) {
        console.log("- Has Opdrachtgever Profile: Yes");
      }
    } else {
      console.log("User NOT found in database");
    }

    // Also check all users to see what exists
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("\n=== All users in database ===");
    allUsers.forEach((u) => {
      console.log(
        `- ${u.email} (${u.name}) - Role: ${u.role} - Created: ${u.createdAt}`,
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
