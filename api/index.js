const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const WALLETS = {
  BTC: "bc1q3ndwq48yvnuxpw8v2s267znssd9dp36w36cyrh",
  ETH: "0xF8675Cf9a0a22214F1aC8D52FE94678A5151a677",
  SOL: "3GJdiNHKHzw6AtegnCBNwLzEebkJhbUxxHTpVE18PoCK",
  BNB: "0xF8675Cf9a0a22214F1aC8D52FE94678A5151a677"
};

app.get('/', (req,res)=>{
  res.send(`
  <html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#0b0e11;color:#eaecef;font-family:sans-serif;padding:20px} .card{background:#1e2329;padding:16px;border-radius:12px;margin:12px 0} .btn{background:#fcd535;color:#000;padding:12px;border-radius:8px;display:block;text-align:center;text-decoration:none;font-weight:bold}</style></head>
  <body><div class="card"><h2>Elite Investments Platform</h2><p>Binance Style Black/Yellow - Working!</p></div>
  <div class="card"><p>BTC: $68k | ETH: $3.5k | SOL: $145</p><a class="btn" href="/deposit">Deposit</a></div>
  <div class="card"><p>Wallets Loaded: BTC, ETH, SOL, BNB</p></div></body></html>
  `);
});

app.get('/deposit', (req,res)=>{
  res.send(`<div style="background:#1e2329;color:white;padding:20px;font-family:sans-serif"><h2>Deposit</h2><p>BTC: ${WALLETS.BTC}</p><p>ETH: ${WALLETS.ETH}</p><p>SOL: ${WALLETS.SOL}</p><p>BNB: ${WALLETS.BNB}</p><a href="/">Home</a></div>`);
});

module.exports = app;
