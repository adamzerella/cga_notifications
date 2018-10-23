const express = require("express");
const helmet = require("helmet");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

const PORT = 4135;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.post("/v0/notify/github/releases", (req, res) => {
	let result = [];

	const options = {
		hostname: `api.github.com`,
		path: `/repos/${req.body.owner}/${req.body.repo}/releases`,
		method: "GET",
		headers: {
			"Authorization": `Authorization: token ${GITHUB_TOKEN}`,
			"User-Agent": `cga_notifications`,
			"Content-Type": "application/json",
		}
	};

	https
		.get(options, response => {
			let body = "";

			response.on("data", function(chunk) {
				body += chunk;
			});

			response.on("end", () => {
				const releases = JSON.parse(body)

				for (let i = 0; i < releases.length; i++) {
					result.push({
						name: releases[i].name,
						tag_name: releases[i].tag_name,
						body: (releases[i].body).substring(64,128)
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
			res.status(200).send(result).end();
		});
});


app.listen(PORT, () =>
	console.log(`Server listening at http://127.0.0.1:${PORT} ...`)
);
