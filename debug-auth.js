const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

const prisma = new PrismaClient();

async function debugAuth() {
  try {
    console.log("🔍 Debugging authentication process...\n");

    const email = "stef@securyflex.com";
    const password = "Admin2024!";

    console.log(`📧 Testing login for: ${email}`);
    console.log(`🔑 Using password: ${password}\n`);

    // Step 1: Find user
    console.log("Step 1: Finding user in database...");
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        zzpProfile: true,
        bedrijfProfile: true,
        opdrachtgever: true,
      },
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("✅ User found");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
    console.log(`   Failed Login Attempts: ${user.failedLoginAttempts}`);
    console.log(`   Locked Until: ${user.lockedUntil}\n`);

    // Step 2: Check account lock
    console.log("Step 2: Checking account lock status...");
    const isLocked =
      user.lockedUntil && new Date(user.lockedUntil) > new Date();
    console.log(`   Account locked: ${isLocked ? "❌ YES" : "✅ No"}\n`);

    if (isLocked) {
      console.log("❌ Account is locked, login would fail");
      return;
    }

    // Step 3: Check email verification
    console.log("Step 3: Checking email verification...");
    if (!user.emailVerified && user.status === "PENDING") {
      console.log(
        "❌ Email not verified and status is PENDING, login would fail",
      );
      return;
    }
    console.log("✅ Email verification check passed\n");

    // Step 4: Password verification
    console.log("Step 4: Testing password verification...");
    console.log(`   Stored hash: ${user.password.substring(0, 30)}...`);

    const passwordValid = await bcryptjs.compare(password, user.password);
    console.log(`   Password valid: ${passwordValid ? "✅ YES" : "❌ NO"}\n`);

    if (!passwordValid) {
      console.log("❌ Password verification failed, login would fail");
      return;
    }

    // Step 5: Profile completeness
    console.log("Step 5: Checking profile completeness...");
    let hasCompletedProfile = false;

    switch (user.role) {
      case "ZZP_BEVEILIGER":
        hasCompletedProfile = !!(
          user.zzpProfile?.kvkNummer && user.zzpProfile?.uurtarief
        );
        break;
      case "BEDRIJF":
        hasCompletedProfile = !!(
          user.bedrijfProfile?.bedrijfsnaam && user.bedrijfProfile?.kvkNummer
        );
        break;
      case "OPDRACHTGEVER":
        hasCompletedProfile = !!user.opdrachtgever?.contactpersoon;
        break;
      case "ADMIN":
        hasCompletedProfile = true; // Admin accounts are always considered complete
        break;
      default:
        hasCompletedProfile = false;
    }

    console.log(
      `   Profile completed: ${hasCompletedProfile ? "✅ YES" : "❌ NO"}\n`,
    );

    // Final result
    console.log("🎯 Final Assessment:");
    console.log(
      `   Login should: ${passwordValid && !isLocked ? "✅ SUCCEED" : "❌ FAIL"}`,
    );

    if (passwordValid && !isLocked) {
      console.log("   User would be returned with:");
      console.log(`     - ID: ${user.id}`);
      console.log(`     - Email: ${user.email}`);
      console.log(`     - Name: ${user.name}`);
      console.log(`     - Role: ${user.role}`);
      console.log(`     - Status: ${user.status}`);
      console.log(`     - Profile Complete: ${hasCompletedProfile}`);
    }
  } catch (error) {
    console.error("❌ Error debugging auth:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth();
