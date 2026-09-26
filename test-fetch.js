const https = require("https");
const url = "https://wanderboat.ai/details/ChIJe6_gf20_rjURVfAbHVBUGbk";
https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, res => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => {
    console.log("Status:", res.statusCode, "Length:", data.length);
    const m = data.match(/https:\/\/[^"'\s<>]+(jpg|jpeg|png|webp)/gi);
    console.log("Images:", m);
  });
}).on("error", err => console.error(err));
