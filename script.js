diff --git a/script.js b/script.js
index 395efd76d8df373387a59ed08925b20c752546bb..df921cae94b3e26ca0c6d190f0748b045f84ece6 100644
--- a/script.js
+++ b/script.js
@@ -1,259 +1,276 @@
 const SHEET_API =
-"https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";
+  "https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";
 
 document.addEventListener("DOMContentLoaded", () => {
+  let products = [];
+  let cart = [];
+
+  // ================= ELEMENTS =================
+  const salesPerson = document.getElementById("salesPerson");
+  const customerName = document.getElementById("customerName");
+  const customerMobile = document.getElementById("customerMobile");
+  const paymentMode = document.getElementById("paymentMode");
+  const modelSearch = document.getElementById("modelSearch");
+  const suggestions = document.getElementById("suggestions");
+
+  const specialEnable = document.getElementById("specialEnable");
+  const specialName = document.getElementById("specialName");
+  const specialAmt = document.getElementById("specialAmt");
+  const specialRow = document.getElementById("specialRow");
+  const specialLabel = document.getElementById("specialLabel");
+  const specialDisc = document.getElementById("specialDisc");
+
+  const comboEnable = document.getElementById("comboEnable");
+  const comboRow = document.getElementById("comboRow");
+  const comboDisc = document.getElementById("comboDisc");
+
+  const cartBody = document.getElementById("cartBody");
+  const orderValue = document.getElementById("orderValue");
+  const webDisc = document.getElementById("webDisc");
+  const upiDisc = document.getElementById("upiDisc");
+  const totalSavings = document.getElementById("totalSavings");
+  const finalPay = document.getElementById("finalPay");
+
+  const sSales = document.getElementById("sSales");
+  const sCustomer = document.getElementById("sCustomer");
+  const sMobile = document.getElementById("sMobile");
+  const offerArea = document.getElementById("offerArea");
+  const offerId = document.getElementById("offerId");
+  const validTill = document.getElementById("validTill");
+
+  const copyScreenshot = document.getElementById("copyScreenshot");
+  const copySummary = document.getElementById("copySummary");
+  const clearCart = document.getElementById("clearCart");
+  const clearAll = document.getElementById("clearAll");
+
+  // ================= AUTOSAVE =================
+  salesPerson.value = localStorage.getItem("salesPerson") || "";
+  salesPerson.oninput = () => {
+    localStorage.setItem("salesPerson", salesPerson.value);
+  };
+
+  // ================= MOBILE =================
+  customerMobile.oninput = () => {
+    customerMobile.value = customerMobile.value.replace(/\D/g, "").slice(0, 10);
+  };
+
+  // ================= LIVE UPDATE =================
+  specialAmt.oninput = calculate;
+  specialName.oninput = calculate;
+  paymentMode.onchange = calculate;
+
+  // ================= SPECIAL TOGGLE =================
+  specialEnable.onchange = () => {
+    specialAmt.disabled = !specialEnable.checked;
+    calculate();
+  };
+
+  // ================= COMBO TOGGLE =================
+  comboEnable.onchange = () => render();
+
+  // ================= FETCH =================
+  fetch(SHEET_API)
+    .then((r) => r.json())
+    .then((d) => {
+      products = d;
+    });
 
-let products = [];
-let cart = [];
-
-
-// ================= ELEMENTS =================
-const specialRow = document.getElementById("specialRow");
-const specialLabel = document.getElementById("specialLabel");
-const specialDisc = document.getElementById("specialDisc");
-
-
-// ================= AUTOSAVE =================
-salesPerson.value = localStorage.getItem("salesPerson") || "";
-salesPerson.oninput = () =>
-  localStorage.setItem("salesPerson", salesPerson.value);
-
-
-// ================= MOBILE =================
-customerMobile.oninput = () => {
-  customerMobile.value =
-    customerMobile.value.replace(/\D/g,'').slice(0,10);
-};
-
-
-// ================= LIVE UPDATE =================
-specialAmt.oninput = calculate;
-specialName.oninput = calculate;
-paymentMode.onchange = calculate;
-
-
-// ================= SPECIAL TOGGLE =================
-specialEnable.onchange = () => {
-  specialAmt.disabled = !specialEnable.checked;
-  calculate();
-};
-
-
-// ================= COMBO TOGGLE =================
-comboEnable.onchange = () => render();
-
-
-// ================= FETCH =================
-fetch(SHEET_API)
-  .then(r => r.json())
-  .then(d => products = d);
-
-
-// ================= SEARCH =================
-modelSearch.oninput = () => {
-  const v = modelSearch.value.toLowerCase();
-  suggestions.innerHTML = "";
+  // ================= SEARCH =================
+  modelSearch.oninput = () => {
+    const v = modelSearch.value.toLowerCase();
+    suggestions.innerHTML = "";
 
-  if (!v) {
-    suggestions.style.display = "none";
-    return;
-  }
+    if (!v) {
+      suggestions.style.display = "none";
+      return;
+    }
 
-  products
-    .filter(p => p.model.toLowerCase().includes(v))
-    .slice(0,20)
-    .forEach(p => {
-      const div = document.createElement("div");
-      div.className = "suggItem";
-      div.innerText = `${p.model} - ₹${p.price}`;
-
-      div.onclick = () => {
-        cart.push({ model:p.model, price:p.price, qty:1, combo:false });
-        modelSearch.value = "";
-        suggestions.style.display = "none";
-        render();
-      };
-
-      suggestions.appendChild(div);
-    });
+    products
+      .filter((p) => p.model.toLowerCase().includes(v))
+      .slice(0, 20)
+      .forEach((p) => {
+        const div = document.createElement("div");
+        div.className = "suggItem";
+        div.innerText = `${p.model} - ₹${p.price}`;
 
-  suggestions.style.display = "block";
-};
+        div.onclick = () => {
+          cart.push({ model: p.model, price: Number(p.price), qty: 1, combo: false });
+          modelSearch.value = "";
+          suggestions.style.display = "none";
+          render();
+        };
 
+        suggestions.appendChild(div);
+      });
 
-// ================= RENDER =================
-function render() {
-  cartBody.innerHTML = "";
+    suggestions.style.display = "block";
+  };
 
-  const selected = cart.filter(p => p.combo).length;
+  // ================= RENDER =================
+  function render() {
+    cartBody.innerHTML = "";
 
-  cart.forEach((p,i) => {
+    const selected = cart.filter((p) => p.combo).length;
 
-    let cb = "";
+    cart.forEach((p, i) => {
+      let cb = "";
 
-    if (comboEnable.checked && p.price >= 5000) {
-      const disable = selected >= 2 && !p.combo;
+      if (comboEnable.checked && p.price >= 5000) {
+        const disable = selected >= 2 && !p.combo;
 
-      cb = `<input type="checkbox"
+        cb = `<input type="checkbox"
               ${p.combo ? "checked" : ""}
               ${disable ? "disabled" : ""}
               onchange="toggleCombo(${i},this.checked)">`;
-    }
-
-    cartBody.innerHTML += `
-      <tr>
-        <td>${cb} ${p.model}</td>
-        <td>₹${p.price}</td>
-        <td>
-          <input type="number" min="1" value="${p.qty}"
-          onchange="updateQty(${i},this.value)">
-        </td>
-        <td>₹${p.price * p.qty}</td>
-        <td><button onclick="removeItem(${i})">❌</button></td>
-      </tr>
-    `;
-  });
-
-  calculate();
-}
-
-window.updateQty = (i,v) => { cart[i].qty = +v; calculate(); };
-window.removeItem = (i) => { cart.splice(i,1); render(); };
-window.toggleCombo = (i,v) => { cart[i].combo = v; render(); };
-
-
-// ================= SLAB =================
-function slab(t) {
-  if(t>=20000) return {web:1000,upi:500};
-  if(t>=15000) return {web:700,upi:300};
-  if(t>=13000) return {web:500,upi:300};
-  if(t>=10000) return {web:500,upi:200};
-  if(t>=5000) return {web:200,upi:100};
-  return {web:0,upi:0};
-}
-
-
-// ================= CALCULATE =================
-function calculate() {
-
-  const original = cart.reduce((s,p)=>s+p.price*p.qty,0);
-
-  // ===== combo only if EXACTLY 2 =====
-  let combo = 0;
-  const comboItems = cart.filter(p => p.combo);
-
-  if (comboEnable.checked && comboItems.length === 2) {
-    comboItems.forEach(p => {
-      combo += p.price * p.qty * 0.03;
+      }
+
+      cartBody.innerHTML += `
+        <tr>
+          <td>${cb} ${p.model}</td>
+          <td>₹${p.price}</td>
+          <td>
+            <input type="number" min="1" value="${p.qty}"
+            onchange="updateQty(${i},this.value)">
+          </td>
+          <td>₹${p.price * p.qty}</td>
+          <td><button onclick="removeItem(${i})">❌</button></td>
+        </tr>
+      `;
     });
-  }
 
-  const afterCombo = original - combo;
+    calculate();
+  }
 
-  const s = slab(afterCombo);
-  const upi = paymentMode.value === "UPI" ? s.upi : 0;
-  const special = specialEnable.checked ? +specialAmt.value || 0 : 0;
+  window.updateQty = (i, v) => {
+    cart[i].qty = Math.max(1, Number(v) || 1);
+    calculate();
+  };
+
+  window.removeItem = (i) => {
+    cart.splice(i, 1);
+    render();
+  };
+
+  window.toggleCombo = (i, v) => {
+    cart[i].combo = v;
+    render();
+  };
+
+  // ================= SLAB =================
+  function slab(t) {
+    if (t >= 20000) return { web: 1000, upi: 500 };
+    if (t >= 15000) return { web: 700, upi: 300 };
+    if (t >= 13000) return { web: 500, upi: 300 };
+    if (t >= 10000) return { web: 500, upi: 200 };
+    if (t >= 5000) return { web: 200, upi: 100 };
+    return { web: 0, upi: 0 };
+  }
 
-  const save = combo + s.web + upi + special;
+  // ================= CALCULATE =================
+  function calculate() {
+    const original = cart.reduce((s, p) => s + p.price * p.qty, 0);
+
+    // Combo discount: only when exactly 2 combo products are selected.
+    let combo = 0;
+    const comboItems = cart.filter((p) => p.combo);
+    if (comboEnable.checked && comboItems.length === 2) {
+      comboItems.forEach((p) => {
+        combo += p.price * p.qty * 0.03;
+      });
+    }
 
-  orderValue.innerText = "₹" + original.toFixed(0);
-  webDisc.innerText = "₹" + s.web;
-  upiDisc.innerText = "₹" + upi;
-  totalSavings.innerText = "₹" + save.toFixed(0);
-  finalPay.innerText = "₹" + Math.max(0, original - save).toFixed(0);
+    // IMPORTANT: Other discounts are calculated after combo deduction.
+    const afterCombo = Math.max(0, original - combo);
 
+    const s = slab(afterCombo);
+    const upi = paymentMode.value === "UPI" ? s.upi : 0;
+    const special = specialEnable.checked ? Number(specialAmt.value) || 0 : 0;
 
-  // ===== combo row =====
-  comboRow.style.display = combo > 0 ? "flex" : "none";
-  comboDisc.innerText = "₹" + Math.round(combo);
+    const otherDiscounts = s.web + upi + special;
+    const save = combo + otherDiscounts;
+    const payable = Math.max(0, afterCombo - otherDiscounts);
 
+    orderValue.innerText = "₹" + original.toFixed(0);
+    webDisc.innerText = "₹" + s.web;
+    upiDisc.innerText = "₹" + upi;
+    totalSavings.innerText = "₹" + save.toFixed(0);
+    finalPay.innerText = "₹" + payable.toFixed(0);
 
-  // ===== special row =====
-  if (special > 0) {
-    specialRow.style.display = "flex";
-    specialDisc.innerText = "₹" + special;
+    comboRow.style.display = combo > 0 ? "flex" : "none";
+    comboDisc.innerText = "₹" + Math.round(combo);
 
-    if (specialName.value) {
-      specialLabel.innerText =
-        `Special Discount (${specialName.value})`;
+    if (special > 0) {
+      specialRow.style.display = "flex";
+      specialDisc.innerText = "₹" + special;
+      specialLabel.innerText = specialName.value
+        ? `Special Discount (${specialName.value})`
+        : "Special Discount";
     } else {
-      specialLabel.innerText = "Special Discount";
+      specialRow.style.display = "none";
     }
 
-  } else {
-    specialRow.style.display = "none";
-  }
-
-
-  // ===== UPI =====
-  upiDisc.parentElement.style.display =
-    paymentMode.value === "UPI" ? "flex" : "none";
-
+    upiDisc.parentElement.style.display = paymentMode.value === "UPI" ? "flex" : "none";
 
-  // ===== screenshot info =====
-  sSales.innerText = salesPerson.value;
-  sCustomer.innerText = customerName.value;
-  sMobile.innerText = customerMobile.value;
-}
-
-
-// ================= OFFER ID =================
-function idGen(){
-  return "HH-" + Date.now().toString().slice(-6);
-}
-
-
-// ================= SCREENSHOT =================
-copyScreenshot.onclick = async () => {
-
-  offerId.innerText = idGen();
+    sSales.innerText = salesPerson.value;
+    sCustomer.innerText = customerName.value;
+    sMobile.innerText = customerMobile.value;
+  }
 
-  const d = new Date(Date.now() + 86400000);
-  const date =
-    ("0"+d.getDate()).slice(-2) + "/" +
-    ("0"+(d.getMonth()+1)).slice(-2) + "/" +
-    d.getFullYear();
+  // ================= OFFER ID =================
+  function idGen() {
+    return "HH-" + Date.now().toString().slice(-6);
+  }
 
-  const time = d.toLocaleTimeString();
-  validTill.innerText = date + ", " + time;
+  // ================= SCREENSHOT =================
+  copyScreenshot.onclick = async () => {
+    offerId.innerText = idGen();
 
-  calculate();
+    const d = new Date(Date.now() + 86400000);
+    const date =
+      ("0" + d.getDate()).slice(-2) +
+      "/" +
+      ("0" + (d.getMonth() + 1)).slice(-2) +
+      "/" +
+      d.getFullYear();
 
-  html2canvas(offerArea).then(async canvas => {
-    const blob = await new Promise(r => canvas.toBlob(r));
-    await navigator.clipboard.write([
-      new ClipboardItem({ "image/png": blob })
-    ]);
-    alert("✅ Copied to clipboard");
-  });
-};
+    const time = d.toLocaleTimeString();
+    validTill.innerText = date + ", " + time;
 
+    calculate();
 
-// ================= SUMMARY =================
-copySummary.onclick = () => {
+    html2canvas(offerArea).then(async (canvas) => {
+      const blob = await new Promise((r) => canvas.toBlob(r));
+      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
+      alert("✅ Copied to clipboard");
+    });
+  };
 
-  const txt = `📦 OFFER ${offerId.innerText}
+  // ================= SUMMARY =================
+  copySummary.onclick = () => {
+    const txt = `📦 OFFER ${offerId.innerText}
 🕒 Valid: ${validTill.innerText}
 
 👨‍💼 Sales: ${salesPerson.value}
 🧑 Customer: ${customerName.value}
 📱 Mobile: ${customerMobile.value}
 
 💰 Order: ${orderValue.innerText}
 🌐 Website: ${webDisc.innerText}
 🏦 UPI: ${upiDisc.innerText}
 🎁 Combo: ${comboDisc.innerText}
 ⭐ Special Discount (${specialName.value || "Manual"}): ${specialDisc.innerText}
 
 🧾 Pay: ${finalPay.innerText}`;
 
-  navigator.clipboard.writeText(txt);
-  alert("✅ Summary copied");
-};
-
+    navigator.clipboard.writeText(txt);
+    alert("✅ Summary copied");
+  };
 
-// ================= CLEAR =================
-clearCart.onclick = () => { cart = []; render(); };
-clearAll.onclick = () => location.reload();
+  // ================= CLEAR =================
+  clearCart.onclick = () => {
+    cart = [];
+    render();
+  };
 
+  clearAll.onclick = () => location.reload();
 });
