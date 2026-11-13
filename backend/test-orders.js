const API_URL = "http://localhost:4000/api";

let token = "";
let userId = 0;

async function test() {
  console.log("🧪 TEST COMMANDES (Orders)");
  console.log("==========================\n");

  try {
    // 1. Register
    console.log("1️⃣  REGISTER - Créer un compte");
    const email = `user${Date.now()}@test.com`;
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email,
        password: "password123456",
        phone: "+221770000000",
      }),
    });

    const registerData = await registerRes.json();
    if (!registerData.success) {
      console.log("❌ REGISTER FAILED:", registerData);
      return;
    }

    token = registerData.data.accessToken;
    userId = registerData.data.user.id;
    console.log("✅ REGISTER OK - Token:", token.substring(0, 20) + "...\n");

    // 2. Get Cart (vide)
    console.log("2️⃣  GET CART - Panier vide");
    const cartRes = await fetch(`${API_URL}/cart`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const cartData = await cartRes.json();
    console.log("✅ CART OK - Items:", cartData.data.items.length);
    const cartId = cartData.data.id;
    console.log("");

    // 3. Add items to cart
    console.log("3️⃣  ADD TO CART - Ajouter produits");

    // D'abord, récupérer les produits
    const productsRes = await fetch(`${API_URL}/products`, {
      method: "GET",
    });

    const productsData = await productsRes.json();
    if (productsData.data.length === 0) {
      console.log("⚠️  Pas de produits! Insérez des produits d'abord.");
      return;
    }

    const product1 = productsData.data[0];
    console.log("Produit 1:", product1.name, "- Prix:", product1.price);

    // Ajouter au panier
    const addCartRes = await fetch(`${API_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product1.id,
        quantity: 2,
      }),
    });

    const addCartData = await addCartRes.json();
    if (!addCartData.success) {
      console.log("❌ ADD CART FAILED:", addCartData);
      return;
    }

    console.log("✅ ADD TO CART OK - Quantité: 2\n");

    // 4. Get Cart (avec items)
    console.log("4️⃣  GET CART - Voir les items");
    const cartRes2 = await fetch(`${API_URL}/cart`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const cartData2 = await cartRes2.json();
    console.log("✅ CART OK - Items:", cartData2.data.items.length);
    console.log("  Total:", cartData2.data.total, "centimes\n");

    // 5. CREATE ORDER
    console.log("5️⃣  CREATE ORDER - Créer commande");
    const orderRes = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shippingAddress: "123 Main Street",
        shippingCity: "Dakar",
        shippingZip: "18000",
      }),
    });

    const orderData = await orderRes.json();
    if (!orderData.success) {
      console.log("❌ CREATE ORDER FAILED:", orderData);
      return;
    }

    const orderId = orderData.data.id;
    console.log("✅ ORDER CREATED:");
    console.log("  ID:", orderId);
    console.log("  Status:", orderData.data.status);
    console.log("  Total:", orderData.data.totalPrice, "centimes");
    console.log("  Items:", orderData.data.items.length, "\n");

    // 6. GET ORDERS (list)
    console.log("6️⃣  GET ORDERS - Lister mes commandes");
    const ordersRes = await fetch(`${API_URL}/orders`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const ordersData = await ordersRes.json();
    console.log("✅ ORDERS FOUND:", ordersData.data.length);
    ordersData.data.forEach((o) => {
      console.log(`  - Order #${o.id}: ${o.status} (${o.totalPrice} centimes)`);
    });
    console.log("");

    // 7. GET ORDER BY ID
    console.log("7️⃣  GET ORDER BY ID - Détails commande");
    const orderDetailRes = await fetch(`${API_URL}/orders/${orderId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const orderDetailData = await orderDetailRes.json();
    console.log("✅ ORDER DETAIL:");
    console.log("  ID:", orderDetailData.data.id);
    console.log("  User:", orderDetailData.data.userId);
    console.log("  Address:", orderDetailData.data.shippingAddress);
    console.log("  City:", orderDetailData.data.shippingCity);
    console.log("  Items:", orderDetailData.data.items.length);
    console.log("  Total:", orderDetailData.data.totalPrice, "centimes");
    console.log("  Status:", orderDetailData.data.status, "\n");

    // 8. Check cart is now empty
    console.log("8️⃣  CHECK CART - Panier vide après commande");
    const cartRes3 = await fetch(`${API_URL}/cart`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const cartData3 = await cartRes3.json();
    console.log("✅ CART ITEMS:", cartData3.data.items.length);
    console.log("  (Devrait être 0)\n");

    console.log("🎉 TOUS LES TESTS RÉUSSIS!");
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
}

test();
