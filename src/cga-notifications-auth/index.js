const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
// const OpenIDStrategy = require("passport-openid").Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuthStrategy;

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

const PORT = 4140;
const CF_ENV = process.env.CF_ENV;
const OAUTH2_CLIENT_ID = process.env.OAUTH_ID;
const OAUTH2_CLIENT_SECRET = process.env.OAUTH_SECRET;

passport.use(new GoogleStrategy({
	consumerKey: OAUTH2_CLIENT_ID,
	consumerSecret: OAUTH2_CLIENT_SECRET,
	callbackURL: `http://127.0.0.1:${PORT}/v0/auth/google/callback`
},
	function (token, tokenSecret, profile, done) {
		User.findOrCreate({ googleId: profile.id }, function (err, user) {
			return done(err, user);
		});
	}
));

app.get("/v0/auth/google", passport.authenticate("google", { scope: "https://www.googleapis.com/auth/userinfo.email" }));

app.get(
	"/v0/auth/google/callback",
	passport.authenticate("google", {
		failureRedirect: "http://127.0.0.1:3000/login",
	}),
	function (req, res) {
		res.redirect("http://127.0.0.1:3000/");
	}
);

app.listen(PORT, () =>
	console.log(`Server listening at http://127.0.0.1:${PORT} ...`)
);
