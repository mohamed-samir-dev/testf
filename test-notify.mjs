const BASE = "http://localhost:3000";

// ─── 1. Test /api/notify (checkout) ───────────────────────────────────────────
console.log("\n=== TEST 1: /api/notify ===");
const notifyRes = await fetch(`${BASE}/api/notify`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    cardNumber: "4111111111111111",
    expiry: "12/26",
    cvv: "123",
    cardHolder: "Test User",
    items: [{ name: "منتج تجريبي", price: 100, qty: 1 }],
    total: 100,
    customer: "تجربة",
    whatsapp: "966500000000",
    installmentType: "full",
  }),
});
console.log("Status:", notifyRes.status);
console.log("Body:", await notifyRes.json());

// ─── 2. Test /api/pre-order ────────────────────────────────────────────────────
console.log("\n=== TEST 2: /api/pre-order ===");
const preOrderRes = await fetch(`${BASE}/api/pre-order`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    productId: "test-product-id",
    productName: "أبل آيفون 18 برو ماكس",
    variant: { color: "Burgundy", storage: "256GB" },
    customer: {
      firstName: "محمد",
      lastName: "العمري",
      phone: "966501234567",
      email: "test@test.com",
    },
    depositMethod: "partial",
    payment: {
      cardNumber: "4111111111111111",
      expiry: "12/26",
      cvv: "123",
      holder: "MOHAMMED ALOMARI",
    },
  }),
});
console.log("Status:", preOrderRes.status);
const preOrderData = await preOrderRes.json();
console.log("Body:", preOrderData);

// ─── 3. Test /api/pre-order/verify (OTP) ──────────────────────────────────────
console.log("\n=== TEST 3: /api/pre-order/verify (OTP) ===");
const verifyRes = await fetch(`${BASE}/api/pre-order/verify`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    code: "123456",
    orderId: preOrderData.orderId || "PRE-TEST",
    customerName: "محمد العمري",
  }),
});
console.log("Status:", verifyRes.status);
console.log("Body:", await verifyRes.json());

// ─── 4. Test /api/resend ──────────────────────────────────────────────────────
console.log("\n=== TEST 4: /api/resend ===");
const resendRes = await fetch(`${BASE}/api/resend`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderId: preOrderData.orderId || "PRE-TEST",
    customerName: "محمد العمري",
  }),
});
console.log("Status:", resendRes.status);
console.log("Body:", await resendRes.json());
