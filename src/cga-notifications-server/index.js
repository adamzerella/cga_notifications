const express = require("express");
const helmet = require("helmet");
const https = require("https");

const app = express();
app.use(helmet());

const PORT = 4123;
const CF_ENV = process.env.CF_ENV;
const CF_TOKEN = process.env.CF_TOKEN;
const CF_HOST = `api.system.${CF_ENV}.cld.gov.au`;

app.get("/v0/cf/users", (req, res) => {
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
						user: {
							username: users[i].entity.username,
							org: users[i].entity.organizations_url,
							spaces: users[i].entity.spaces_url,
						},
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
