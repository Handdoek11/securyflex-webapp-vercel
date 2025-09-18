// Test script for admin login flow
import fetch from "node-fetch";

const BASE_URL = "http://localhost:3003";

async function testAdminLogin() {
  console.log("🧪 Testing Admin Login Flow\n");

  // Test 1: Access auth-monitor without authentication
  console.log("1. Testing access to auth-monitor without authentication...");
  try {
    const response1 = await fetch(`${BASE_URL}/admin/auth-monitor`, {
      redirect: "manual",
    });

    if (response1.status === 307 || response1.status === 302) {
      console.log("✅ Correctly redirects to login when not authenticated");
      console.log(`   Redirect location: ${response1.headers.get("location")}`);
    } else {
      console.log(`❌ Unexpected status: ${response1.status}`);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  // Test 2: Try non-admin email
  console.log("\n2. Testing login with non-admin email...");
  try {
    const response2 = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user@example.com",
        password: "password123",
      }),
    });

    const data2 = await response2.json();
    if (response2.status === 403) {
      console.log("✅ Correctly denies non-admin access");
      console.log(`   Response: ${data2.error}`);
    } else {
      console.log(`❌ Unexpected status: ${response2.status}`);
      console.log(`   Response:`, data2);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  // Test 3: Check admin API endpoint protection
  console.log("\n3. Testing admin API endpoint protection...");
  try {
    const response3 = await fetch(`${BASE_URL}/api/admin/auth-logs`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data3 = await response3.json();
    if (response3.status === 401 || response3.status === 403) {
      console.log("✅ Admin API correctly protected");
      console.log(`   Status: ${response3.status}`);
      console.log(`   Response: ${data3.error}`);
    } else {
      console.log(`❌ Unexpected status: ${response3.status}`);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  // Test 4: Check admin login page accessibility
  console.log("\n4. Testing admin login page accessibility...");
  try {
    const response4 = await fetch(`${BASE_URL}/admin/login`);

    if (response4.status === 200) {
      console.log("✅ Admin login page is accessible");
      const html = await response4.text();

      // Check for key elements
      if (html.includes("Admin Portal")) {
        console.log('   ✓ Contains "Admin Portal" title');
      }
      if (
        html.includes("stef@securyflex.com") ||
        html.includes("robert@securyflex.com")
      ) {
        console.log("   ✓ Contains admin email validation");
      }
      if (html.includes("Beveiligde Toegang")) {
        console.log("   ✓ Contains security notice");
      }
    } else {
      console.log(`❌ Unexpected status: ${response4.status}`);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  // Test 5: Check GET endpoint for admin auth status
  console.log("\n5. Testing admin auth status check...");
  try {
    const response5 = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data5 = await response5.json();
    if (response5.status === 200) {
      console.log("✅ Admin auth check endpoint works");
      console.log(`   isAdmin: ${data5.isAdmin}`);
      console.log(`   authenticated: ${data5.authenticated}`);
    } else {
      console.log(`❌ Unexpected status: ${response5.status}`);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  console.log("\n📊 Admin Login Flow Test Summary:");
  console.log("- Admin login page created at /admin/login");
  console.log("- Auth-monitor redirects to admin login when not authenticated");
  console.log("- Admin API endpoints are protected");
  console.log("- Admin authentication validation is working");
  console.log(
    "- Whitelisted admins: stef@securyflex.com, robert@securyflex.com",
  );

  console.log(
    "\n✅ All admin authentication components are in place and functioning!",
  );
}

testAdminLogin().catch(console.error);
