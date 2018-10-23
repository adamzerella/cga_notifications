const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const govau_notify = require('notifications-node-client').NotifyClient;

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser());

const PORT = 4130;
const NOTIFY_API = process.env.NOTIFY_API;
const NOTIFY_BASE = process.env.NOTIFY_BASE;

const notify = new govau_notify(NOTIFY_BASE, NOTIFY_API);

app.post("/v0/notify/send", (req, res) => {
	notify.sendEmail(req.body.templateId, req.body.to, {})
		.then(response => console.log(`Sending email with templateId ${req.body.templateId} to: ${req.body.to}...`))
		.catch(err => console.error(err));
	
	res.status(200).send().end();
});

app.get("/v0/notify/templates", async (req, res) => {
	res.setHeader(
		"Access-Control-Allow-Origin",
		"http://127.0.0.1:3000"
	);

	let templates = await notify.getAllTemplates("email")
		.then(response => response.body.templates)
		.catch(error => console.error(error));
	
	res.status(200).send(templates).end();
});
	
app.listen(PORT, () =>
	console.log(`Server listening at http://127.0.0.1:${PORT} ...`)
);
