const express = require("express");
const helmet = require("helmet");
const https = require("https");

const app = express();
app.use(helmet());

const PORT = 4123;
const CF_ENV = process.env.CF_ENV;
const CF_TOKEN = process.env.CF_TOKEN;
const CF_HOST = `https://api.system.${CF_ENV}.cld.gov.au/v2`;

app.get("/v0/cf/users", (req, res) => {
  let cf_users = {};
  const options = {
    hostname: `https://api.system.${CF_ENV}.cld.gov.au/v2`,
    path: "/users",
    method: "GET",
    headers: {
      "Authorization": `${CF_TOKEN}`,
      "Access-Control-Allow-Origin": "http://localhost:3000"
    }
  };

  https.request(options, (res) => {
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      console.log('No more data in response.');
    });
  });

  res.send(cf_users).end();
});

app.listen(PORT, () =>
  console.log(`Server listening at http://127.0.0.1:${PORT} ...`)
);
