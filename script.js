const SHEET_API =
"https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";

document.addEventListener("DOMContentLoaded", () => {

let products = [];
let cart = [];

const specialRow = document.getElementById("specialRow");
const specialLabel = document.getElementById("specialLabel");
const specialDisc = document.getElementById("specialDisc");

const comboRow = document.getElementById("comboRow");
const comboLabel = document.getElementById("comboLabel");
const comboDisc = document.getElementById("comboDisc");

const upiQRSection = document.getElementById("upiQRSection");
const copyQRBtn = document.getElementById("copyQRBtn");
const upiQRImage = document.getElementById("upiQRImage");


// autosave
salesPerson.value = localStorage.getItem("salesPerson") || "";
salesPerson.oninput = () =>
  localStorage.setItem("salesPerson", salesPerson.value);


// mobile limit
customerMobile.oninput = () => {
  customerMobile.value =
    customerMobile.value.replace(/\D/g,'').slice(0,10);
};


// live updates
specialAmt.oninput = calculate;
specialName.oninput = calculate;
paymentMode.onchange = calculate;


// toggle special
specialEnable.onchange = () => {
  specialAmt.disabled = !specialEnable.checked;
  calculate();
};


// combo toggle
comboEnable.onchange = () => render();


// fetch
fetch(SHEET_API).then(r=>r.json()).then(d=>products=d);


// search
modelSearch.oninput = () => {
  const v = modelSearch.value.toLowerCase();
  suggestions.innerHTML = "";

  if(!v){ suggestions.style.display="none"; return; }

  products.filter(p=>p.model.toLowerCase().includes(v))
  .slice(0,20)
  .forEach(p=>{
    const div=document.createElement("div");
    div.className="suggItem";
    div.innerText=`${p.model} - ₹${p.price}`;

    div.onclick=()=>{
      cart.push({model:p.model,price:p.price,qty:1,combo:false});
      modelSearch.value="";
      suggestions.style.display="none";
      render();
    };

    suggestions.appendChild(div);
  });

  suggestions.style.display="block";
};


// render
function render(){
  cartBody.innerHTML="";
  const selected = cart.filter(p=>p.combo).length;

  cart.forEach((p,i)=>{
    let cb="";

    if(comboEnable.checked && p.price>=5000){
      const disable = selected>=2 && !p.combo;
      cb=`<input type="checkbox"
          ${p.combo?"checked":""}
          ${disable?"disabled":""}
          onchange="toggleCombo(${i},this.checked)">`;
    }

    cartBody.innerHTML+=`
    <tr>
      <td>${cb} ${p.model}</td>
      <td>₹${p.price}</td>
      <td><input type="number" min="1" value="${p.qty}"
      onchange="updateQty(${i},this.value)"></td>
      <td>₹${p.price*p.qty}</td>
      <td><button onclick="removeItem(${i})">❌</button></td>
    </tr>`;
  });

  calculate();
}

window.updateQty=(i,v)=>{cart[i].qty=+v;calculate();};
window.removeItem=(i)=>{cart.splice(i,1);render();};
window.toggleCombo=(i,v)=>{cart[i].combo=v;render();};


// slab
function slab(t){
  if(t>=20000) return {web:1000,upi:500};
  if(t>=15000) return {web:700,upi:300};
  if(t>=13000) return {web:500,upi:300};
  if(t>=10000) return {web:500,upi:200};
  if(t>=5000) return {web:200,upi:100};
  return {web:0,upi:0};
}


// calculate
function calculate(){

  const original = cart.reduce((s,p)=>s+p.price*p.qty,0);
  let running = original;

  let combo=0;
  const comboItems = cart.filter(p=>p.combo);

  if(comboEnable.checked && comboItems.length===2){
    comboItems.forEach(p=>combo+=p.price*p.qty*0.03);
    combo=Math.round(combo);
    running-=combo;
  }

  const s = slab(running);
  running-=s.web;

  const upi = paymentMode.value==="UPI"?s.upi:0;
  running-=upi;

  const special = specialEnable.checked?+specialAmt.value||0:0;
  running-=special;

  const final = Math.max(0,running);
  const save = original-final;

  orderValue.innerText="₹"+original;
  webDisc.innerText="₹"+s.web;
  upiDisc.innerText="₹"+upi;
  totalSavings.innerText="₹"+save;
  finalPay.innerText="₹"+final;


  if(combo>0){
    comboRow.style.display="flex";
    comboDisc.innerText="₹"+combo;
    const names=comboItems.map(p=>p.model).join(", ");
    comboLabel.innerText=`Combo Discount (${names})`;
  }else comboRow.style.display="none";


  if(special>0){
    specialRow.style.display="flex";
    specialDisc.innerText="₹"+special;
    specialLabel.innerText = specialName.value ?
      `Special Discount (${specialName.value})` :
      "Special Discount";
  }else specialRow.style.display="none";


  upiDisc.parentElement.style.display =
    paymentMode.value==="UPI"?"flex":"none";

  upiQRSection.style.display =
    paymentMode.value==="UPI"?"block":"none";

  sSales.innerText=salesPerson.value;
  sCustomer.innerText=customerName.value;
  sMobile.innerText=customerMobile.value;
}


// offer id series
function idGen(){
  let last = localStorage.getItem("offerCounter");
  if(!last) last=201;
  else last=Number(last)+1;
  localStorage.setItem("offerCounter",last);
  return "HH"+last;
}


// screenshot
copyScreenshot.onclick=async()=>{
  offerId.innerText=idGen();

  const d=new Date(Date.now()+86400000);
  const date=("0"+d.getDate()).slice(-2)+"/"+
  ("0"+(d.getMonth()+1)).slice(-2)+"/"+d.getFullYear();
  const time=d.toLocaleTimeString();
  validTill.innerText=date+", "+time;

  calculate();

  html2canvas(offerArea).then(async canvas=>{
    const blob=await new Promise(r=>canvas.toBlob(r));
    await navigator.clipboard.write([
      new ClipboardItem({"image/png":blob})
    ]);
    alert("Copied");
  });
};


// summary
copySummary.onclick=()=>{
  const txt=`📦 ${offerId.innerText}
🕒 ${validTill.innerText}
👨‍💼 ${salesPerson.value}
🧑 ${customerName.value}
📱 ${customerMobile.value}

💰 ${orderValue.innerText}
🌐 ${webDisc.innerText}
🏦 ${upiDisc.innerText}
🎁 ${comboLabel.innerText}: ${comboDisc.innerText}
⭐ ${specialLabel.innerText}: ${specialDisc.innerText}

🧾 ${finalPay.innerText}`;

  navigator.clipboard.writeText(txt);
  alert("Summary copied");
};


// QR copy
copyQRBtn.onclick=async()=>{
  const r=await fetch(upiQRImage.src);
  const blob=await r.blob();
  await navigator.clipboard.write([
    new ClipboardItem({"image/png":blob})
  ]);
  alert("QR copied");
};


// clear
clearCart.onclick=()=>{cart=[];render();};
clearAll.onclick=()=>location.reload();

});
