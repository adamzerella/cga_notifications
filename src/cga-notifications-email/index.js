const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require('nodemailer');

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

const PORT = 4125;
const MAIL_HOST = process.env.MAIL_HOST
const MAIL_USER = process.env.MAIL_USER
const MAIL_PASS = process.env.MAIL_PASS

app.post("/v0/send", (req, res) => {
	let transporter = nodemailer.createTransport({
		host: MAIL_HOST,
		port: 587,
		secure: false,
		auth: {
			user: MAIL_USER,
			pass: MAIL_PASS
		}
	});

	let mailOptions = {
		from: req.body.to, //TODO Provide from email
		to: req.body.to,
		subject: req.body.subject,
		text: req.body.message,
		html: req.body.message
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log(info)
	});

	res.status(200).send();
});

app.listen(PORT, () =>
	console.log(`Server listening at http://127.0.0.1:${PORT} ...`)
);
