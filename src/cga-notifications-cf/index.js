const express = require("express");
const helmet = require("helmet");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

const PORT = 4120;
const CF_ENV = process.env.CF_ENV;
const CF_TOKEN = process.env.CF_TOKEN;
const CF_HOST = `api.system.${CF_ENV}.cld.gov.au`;

app.get("/v0/notify/cf/users", (req, res) => {
	let result = [];
	const options = {
		hostname: CF_HOST,
		path: "/v2/users",
		method: "GET",
		headers: {
			Authorization: `${CF_TOKEN}`,
			"Content-Type": "application/json",
		},
	};

	https
		.get(options, response => {
			let body = "";

			response.on("data", function(chunk) {
				body += chunk;
			});

			response.on("end", () => {
				const users = JSON.parse(body).resources;

				for (let i = 0; i < users.length; i++) {
					result.push({
						guid: users[i].metadata.guid,
						username: users[i].entity.username,
						org: users[i].entity.organizations_url,
						spaces: users[i].entity.spaces_url
					});
				}
			});
		})
		.on("error", e => {
			console.error(e);
		})
		.on("close", () => {
			res.setHeader(
				"Access-Control-Allow-Origin",
				"http://127.0.0.1:3000"
			);
			res.status(200).send(result);
		});
});

app.get("/v0/notify/cf/report-buildpacks", (req, res, next) => {
	fs.readFile(`${path.resolve(__dirname, 'static/report-buildpacks.json')}`, "utf-8", (err, data) => {
		if (err) throw err;
		res.setHeader(
			"Access-Control-Allow-Origin",
			"http://127.0.0.1:3000"
		);
		res.status(200).send(JSON.parse(data)).end();
	  });
});

app.post("/v0/notify/cf/user-spaces", (req, res) => {
	let result = [];

	const options = {
		hostname: CF_HOST,
		path: `/v2/users/${req.body.userId}/spaces`,
		method: "GET",
		headers: {
			Authorization: `${CF_TOKEN}`,
			"Content-Type": "application/json",
		},
	};

	https
		.get(options, response => {
			let body = "";

			response.on("data", function(chunk) {
				body += chunk;
			});

			response.on("end", () => {
				const spaces = JSON.parse(body).resources;

				for (let i = 0; i < spaces.length; i++) {
					result.push({
						guid: spaces[i].metadata.guid,
						name: spaces[i].entity.name,
						org: spaces[i].entity.organization_guid
					});
				}
			});
		})
		.on("error", e => {
			console.error(e);
		})
		.on("close", () => {
			res.setHeader(
				"Access-Control-Allow-Origin",
				"http://127.0.0.1:3000"
			);
			res.status(200).send(result);
		});
});

app.listen(PORT, () =>
	console.log(`Server listening at http://127.0.0.1:${PORT} ...`)
);
