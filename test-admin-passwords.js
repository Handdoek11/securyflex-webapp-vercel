const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

const prisma = new PrismaClient();

async function testAdminPasswords() {
  try {
    console.log("🔐 Testing admin password verification...\n");

    const testPassword = "Admin2024!";
    const adminEmails = ["stef@securyflex.com", "robert@securyflex.com"];

    for (const email of adminEmails) {
      console.log(`🔍 Testing ${email}:`);

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
        },
      });

      if (!user) {
        console.log(`   ❌ User not found\n`);
        continue;
      }

      console.log(`   ✅ User found: ${user.name}`);
      console.log(
        `   🔑 Stored password hash: ${user.password.substring(0, 30)}...`,
      );

      // Test password verification
      const isValid = await bcryptjs.compare(testPassword, user.password);
      console.log(
        `   🧪 Password verification result: ${isValid ? "✅ VALID" : "❌ INVALID"}`,
      );

      if (!isValid) {
        console.log(
          `   ⚠️  The password '${testPassword}' does NOT match the stored hash`,
        );

        // Let's create a new hash to see what it should look like
        const newHash = await bcryptjs.hash(testPassword, 12);
        console.log(
          `   🔧 New hash for '${testPassword}': ${newHash.substring(0, 30)}...`,
        );

        // Test if the new hash would work
        const newHashValid = await bcryptjs.compare(testPassword, newHash);
        console.log(
          `   ✅ New hash verification: ${newHashValid ? "VALID" : "INVALID"}`,
        );
      } else {
        console.log(`   ✅ Password is correct!`);
      }

      console.log("");
    }

    // Test what happens when we create a fresh admin account
    console.log("🧪 Creating test hash for verification:");
    const testHash = await bcryptjs.hash(testPassword, 12);
    console.log(`   Test hash: ${testHash.substring(0, 30)}...`);

    const testVerification = await bcryptjs.compare(testPassword, testHash);
    console.log(
      `   Test verification: ${testVerification ? "✅ WORKS" : "❌ FAILED"}`,
    );
  } catch (error) {
    console.error("❌ Error testing passwords:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminPasswords();
