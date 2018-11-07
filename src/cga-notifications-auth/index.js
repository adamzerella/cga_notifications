const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const URL = require('url').URL;
const passport = require("passport");
const OAuthStrategy = require('passport-oauth').OAuthStrategy;

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

const PORT = 4140;
const CF_ENV = process.env.CF_ENV;
const CF_CLIENT_ID = process.env.CF_CLIENT_ID;
const CF_CLIENT_SECRET = process.env.CF_CLIENT_SECRET;
const CF_CALLBACK_URL = new URL(`https://uaa.system.${CF_ENV}.cld.gov.au`)
const CF_REQUEST_URL = new URL(`https://www.provider.com/oauth/request_token`)
const CF_ACCESS_URL = new URL(`https://www.provider.com/oauth/access_token`)
const CF_AUTH_URL = new URL(`https://www.provider.com/oauth/authorize`)

passport.use('provider', new OAuthStrategy({
    requestTokenURL: CF_REQUEST_URL,
    accessTokenURL: CF_ACCESS_URL,
    userAuthorizationURL: CF_AUTH_URL,
    consumerKey: CF_CLIENT_ID,
    consumerSecret: CF_CLIENT_SECRET,
    callbackURL: CF_CALLBACK_URL
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate(profile.id, function(err, user) {
      done(err, user);
    });
  }
));

app.get(`/v0/auth/cf`, (req, res) => {
	//TODO
});

app.listen(PORT, () =>
	console.log(`Server listening at http://127.0.0.1:${PORT} ...`)
);
