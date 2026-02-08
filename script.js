const SHEET_API =
"https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";

const upiQRBox = document.getElementById("upiQRBox");
const upiQRSection = document.getElementById("upiQRSection");
const copyQRBtn = document.getElementById("copyQRBtn");
const upiQRImage = document.getElementById("upiQRImage");

document.addEventListener("DOMContentLoaded", () => {

let products = [];
let cart = [];


// ================= ELEMENTS =================
const specialRow = document.getElementById("specialRow");
const specialLabel = document.getElementById("specialLabel");
const specialDisc = document.getElementById("specialDisc");

const comboRow = document.getElementById("comboRow");
const comboLabel = document.getElementById("comboLabel");
const comboDisc = document.getElementById("comboDisc");


// ================= AUTOSAVE =================
salesPerson.value = localStorage.getItem("salesPerson") || "";
salesPerson.oninput = () =>
  localStorage.setItem("salesPerson", salesPerson.value);


// ================= MOBILE LIMIT =================
customerMobile.oninput = () => {
  customerMobile.value =
    customerMobile.value.replace(/\D/g,'').slice(0,10);
};


// ================= LIVE RECALC =================
specialAmt.oninput = calculate;
specialName.oninput = calculate;
paymentMode.onchange = calculate;


// ================= SPECIAL TOGGLE =================
specialEnable.onchange = () => {
  specialAmt.disabled = !specialEnable.checked;
  calculate();
};


// ================= COMBO TOGGLE =================
comboEnable.onchange = () => render();


// ================= FETCH =================
fetch(SHEET_API)
  .then(r => r.json())
  .then(d => products = d);


// ================= SEARCH =================
modelSearch.oninput = () => {
  const v = modelSearch.value.toLowerCase();
  suggestions.innerHTML = "";

  if (!v) {
    suggestions.style.display = "none";
    return;
  }

  products
    .filter(p => p.model.toLowerCase().includes(v))
    .slice(0,20)
    .forEach(p => {
      const div = document.createElement("div");
      div.className = "suggItem";
      div.innerText = `${p.model} - ₹${p.price}`;

      div.onclick = () => {
        cart.push({ model:p.model, price:p.price, qty:1, combo:false });
        modelSearch.value = "";
        suggestions.style.display = "none";
        render();
      };

      suggestions.appendChild(div);
    });

  suggestions.style.display = "block";
};


// ================= RENDER =================
function render() {
  cartBody.innerHTML = "";

  const selected = cart.filter(p => p.combo).length;

  cart.forEach((p,i) => {

    let cb = "";

    if (comboEnable.checked && p.price >= 5000) {
      const disable = selected >= 2 && !p.combo;

      cb = `<input type="checkbox"
              ${p.combo ? "checked" : ""}
              ${disable ? "disabled" : ""}
              onchange="toggleCombo(${i},this.checked)">`;
    }

    cartBody.innerHTML += `
      <tr>
        <td>${cb} ${p.model}</td>
        <td>₹${p.price}</td>
        <td>
          <input type="number" min="1" value="${p.qty}"
          onchange="updateQty(${i},this.value)">
        </td>
        <td>₹${p.price * p.qty}</td>
        <td><button onclick="removeItem(${i})">❌</button></td>
      </tr>
    `;
  });

  calculate();
}

window.updateQty = (i,v) => { cart[i].qty = +v; calculate(); };
window.removeItem = (i) => { cart.splice(i,1); render(); };
window.toggleCombo = (i,v) => { cart[i].combo = v; render(); };


// ================= SLAB =================
function slab(t) {
  if(t>=20000) return {web:1000,upi:500};
  if(t>=15000) return {web:700,upi:300};
  if(t>=13000) return {web:500,upi:300};
  if(t>=10000) return {web:500,upi:200};
  if(t>=5000) return {web:200,upi:100};
  return {web:0,upi:0};
}


// ================= CALCULATE =================
function calculate() {

  const original = cart.reduce((s,p)=>s+p.price*p.qty,0);
  let runningTotal = original;

  // ===== QR visibility =====
upiQRBox.style.display =
  paymentMode.value === "UPI" ? "block" : "none";

  upiQRSection.style.display =
  paymentMode.value === "UPI" ? "block" : "none";



  // ===== COMBO FIRST =====
  let combo = 0;
  const comboItems = cart.filter(p => p.combo);

  if (comboEnable.checked && comboItems.length === 2) {
    comboItems.forEach(p => {
      combo += p.price * p.qty * 0.03;
    });
    combo = Math.round(combo);
    runningTotal -= combo;
  }

  // ===== WEBSITE =====
  const s = slab(runningTotal);
  runningTotal -= s.web;

  // ===== UPI =====
  const upi = paymentMode.value === "UPI" ? s.upi : 0;
  runningTotal -= upi;

  // ===== SPECIAL =====
  const special = specialEnable.checked ? +specialAmt.value || 0 : 0;
  runningTotal -= special;

  const final = Math.max(0, runningTotal);
  const save = original - final;


  // ===== display =====
  orderValue.innerText = "₹" + original.toFixed(0);
  webDisc.innerText = "₹" + s.web;
  upiDisc.innerText = "₹" + upi;
  totalSavings.innerText = "₹" + save.toFixed(0);
  finalPay.innerText = "₹" + final.toFixed(0);


  // ===== COMBO ROW WITH NAMES =====
  if (combo > 0) {
    comboRow.style.display = "flex";
    comboDisc.innerText = "₹" + combo;

    const names = comboItems.map(p => p.model).join(", ");
    comboLabel.innerText = `Combo Discount (${names})`;

  } else {
    comboRow.style.display = "none";
  }


  // ===== SPECIAL ROW =====
  if (special > 0) {
    specialRow.style.display = "flex";
    specialDisc.innerText = "₹" + special;

    if (specialName.value) {
      specialLabel.innerText =
        `Special Discount (${specialName.value})`;
    } else {
      specialLabel.innerText = "Special Discount";
    }

  } else {
    specialRow.style.display = "none";
  }


  // ===== UPI =====
  upiDisc.parentElement.style.display =
    paymentMode.value === "UPI" ? "flex" : "none";


  // ===== screenshot info =====
  sSales.innerText = salesPerson.value;
  sCustomer.innerText = customerName.value;
  sMobile.innerText = customerMobile.value;
}


// ================= OFFER ID =================
function idGen(){
  return "HH-" + Date.now().toString().slice(-6);
}


// ================= SCREENSHOT =================
copyScreenshot.onclick = async () => {
copyQRBtn.onclick = async () => {

  const response = await fetch(upiQRImage.src);
  const blob = await response.blob();

  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob })
  ]);

  alert("✅ QR copied");
};

  offerId.innerText = idGen();

  const d = new Date(Date.now() + 86400000);
  const date =
    ("0"+d.getDate()).slice(-2) + "/" +
    ("0"+(d.getMonth()+1)).slice(-2) + "/" +
    d.getFullYear();

  const time = d.toLocaleTimeString();
  validTill.innerText = date + ", " + time;

  calculate();

  html2canvas(offerArea).then(async canvas => {
    const blob = await new Promise(r => canvas.toBlob(r));
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);
    alert("✅ Copied to clipboard");
  });
};


// ================= SUMMARY =================
copySummary.onclick = () => {

  const txt = `📦 OFFER ${offerId.innerText}
🕒 Valid: ${validTill.innerText}

👨‍💼 Sales: ${salesPerson.value}
🧑 Customer: ${customerName.value}
📱 Mobile: ${customerMobile.value}

💰 Order: ${orderValue.innerText}
🌐 Website: ${webDisc.innerText}
🏦 UPI: ${upiDisc.innerText}
🎁 ${comboLabel.innerText}: ${comboDisc.innerText}
⭐ Special Discount (${specialName.value || "Manual"}): ${specialDisc.innerText}

🧾 Pay: ${finalPay.innerText}`;

  navigator.clipboard.writeText(txt);
  alert("✅ Summary copied");
};


// ================= CLEAR =================
clearCart.onclick = () => { cart = []; render(); };
clearAll.onclick = () => location.reload();

});
