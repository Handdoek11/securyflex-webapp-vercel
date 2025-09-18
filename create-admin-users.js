const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdminUsers() {
  try {
    console.log("🔐 Creating admin accounts...");

    // Admin accounts to create
    const adminAccounts = [
      {
        email: "stef@securyflex.com",
        name: "Stef van der Weijden",
        password: "Admin2024!", // Change this to a secure password
      },
      {
        email: "robert@securyflex.com",
        name: "Robert",
        password: "Admin2024!", // Change this to a secure password
      },
    ];

    for (const admin of adminAccounts) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: admin.email },
      });

      if (existingUser) {
        console.log(`✅ User ${admin.email} already exists - skipping`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(admin.password, 12);

      // Create the admin user
      const user = await prisma.user.create({
        data: {
          email: admin.email,
          name: admin.name,
          password: hashedPassword,
          role: "ADMIN", // Special admin role
          status: "ACTIVE",
          emailVerified: new Date(), // Auto-verify admin accounts
        },
      });

      console.log(`✅ Created admin user: ${admin.email} (ID: ${user.id})`);
      console.log(`   Password: ${admin.password}`);
      console.log(`   ⚠️  Please change this password after first login!`);
    }

    console.log("\n🎉 Admin accounts created successfully!");
    console.log("\nYou can now login at: http://localhost:3001/auth/login");
    console.log("Email: stef@securyflex.com or robert@securyflex.com");
    console.log("Password: Admin2024!");
    console.log(
      "\n⚠️  IMPORTANT: Change these passwords immediately after first login!",
    );
  } catch (error) {
    console.error("❌ Error creating admin users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUsers();
