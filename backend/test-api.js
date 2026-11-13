const API_URL = "http://localhost:4000/api";

async function testAuth() {
  console.log("🧪 TESTING BACKEND API");
  console.log("====================\n");

  // Test 1: Register
  console.log("1️⃣  TEST REGISTER");
  const registerData = {
    name: "Moussa Koffi",
    email: `moussa${Date.now()}@test.com`,
    password: "password123456",
    phone: "+221770123456",
  };

  console.log("📤 Sending:", JSON.stringify(registerData, null, 2));

  const registerRes = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData),
  });

  const registerJson = await registerRes.json();
  console.log("📥 Response:", JSON.stringify(registerJson, null, 2));

  if (!registerJson.success) {
    console.log("❌ REGISTER FAILED!");
    return;
  }

  console.log("✅ REGISTER SUCCESS!\n");
  const accessToken = registerJson.data.accessToken;

  // Test 2: Get Profile
  console.log("2️⃣  TEST GET PROFILE (avec token)");
  const profileRes = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const profileJson = await profileRes.json();
  console.log("📥 Response:", JSON.stringify(profileJson, null, 2));

  if (profileJson.success) {
    console.log("✅ PROFILE SUCCESS!\n");
  } else {
    console.log("❌ PROFILE FAILED!\n");
  }

  // Test 3: Get Cart
  console.log("3️⃣  TEST GET CART (avec token)");
  const cartRes = await fetch(`${API_URL}/cart`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const cartJson = await cartRes.json();
  console.log("📥 Response:", JSON.stringify(cartJson, null, 2));

  if (cartJson.success) {
    console.log("✅ CART SUCCESS!\n");
  } else {
    console.log("❌ CART FAILED!\n");
  }

  console.log("🎉 ALL TESTS DONE!");
}

testAuth().catch((err) => {
  console.error("❌ ERROR:", err.message);
  process.exit(1);
});
