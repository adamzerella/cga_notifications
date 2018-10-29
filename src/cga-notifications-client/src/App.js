import React, { Component } from "react";

import "./App.css";

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedTemplate: "",
			buildpacks: [],
			templates: [],
			users: [],
			to: "",
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleNotify = this.handleNotify.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	/**
	 * Post form data to cga-notifications-notify module
	 * @param { Object } event
	 */
	handleSubmit(event) {
		event.preventDefault();

		fetch("http://127.0.0.1:4130/v0/notify/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				to: this.state.to,
				templateId: this.state.selectedTemplate,
			}),
		});
	}

	/**
	 * TODO Get users that match org/space for email and email
	 * Email a static address with a static template to notify of an outdated buildpack.
	 * @param { Object } event - Data from table <tr> { organization: "abc", ... }
	 */
	handleNotify(event) {
		Promise.all(
			this.state.users.map(async user => {
				return {
					user: user.username,
					spaces: await this.fetchUserSpaces(user.guid),
				};
			})
		).then(result => {
			let emails = [];

			result.map(user => {
				for (let i = 0; i < user.spaces.length; i++) {
					if (user.spaces[i].name === event.space) {
						emails.push(user.user);
						console.log(`Emailing ${user.user}`);
					}
				}
			});

			// Call filterUsers(emails)...

			fetch("http://127.0.0.1:4130/v0/notify/buildpack/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					to: "adam.zerella@digital.gov.au",
					templateId: "d5dfe505-fc99-44f8-b147-38b6c096313a",
					buildpack: event,
				}),
			});
		});
	}

	/**
	 * Map form event fields to state
	 * @param {} event
	 */
	handleChange(event) {
		event.preventDefault();
		this.setState({ [event.target.name]: event.target.value });
	}

	async componentDidMount() {
		this.setState({
			users: await this.fetchUsers(),
			templates: await this.fetchTemplates(),
			buildpacks: await this.fetchReportedBuildpacks(),
		});
	}

	/**
	 * Fetch users from local CF instance /v2/api
	 * @see https://apidocs.cloudfoundry.org/5.1.0/users/list_all_users.html
	 */
	fetchUsers() {
		return fetch("http://127.0.0.1:4120/v0/notify/cf/users", {
			method: "GET",
		})
			.then(response => {
				return response.json();
			})
			.catch(err => {
				console.error(err);
			});
	}

	/**
	 * Fetch notify.gov.au email templates
	 */
	fetchTemplates() {
		return fetch("http://127.0.0.1:4130/v0/notify/templates", {
			method: "GET",
		})
			.then(response => {
				return response.json();
			})
			.catch(err => {
				console.error(err);
			});
	}

	/**
	 * Return a list of buildpacks that are outdated. Currently from static file
	 * TODO Pull from cf-report-buildpacks plugin.
	 */
	fetchReportedBuildpacks() {
		return fetch("http://127.0.0.1:4120/v0/notify/cf/report-buildpacks", {
			method: "GET",
		})
			.then(response => {
				return response.json();
			})
			.catch(err => {
				console.error(err);
			});
	}

	/**
	 * Return a list of spaces that the given user belongs to
	 * @param {*} userId - e.g 7f32fa31-12fd-4386-9545-3fe08bddf73d
	 * @see https://apidocs.cloudfoundry.org/5.1.0/users/list_all_spaces_for_the_user.html
	 */
	fetchUserSpaces(userId) {
		return fetch("http://127.0.0.1:4120/v0/notify/cf/user-spaces", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ userId: userId }),
		})
			.then(response => {
				return response.json();
			})
			.catch(err => {
				console.error(err);
			});
	}

	/**
	 * Filter users state list for emails and render as <option/> keys
	 * @param {Object} users
	 */
	renderOptionKeys(users) {
		let items = this.filterUsers(users);

		return items.map((ele, index) => {
			return (
				<option key={index} value={ele.user.username}>
					{ele.user.username}
				</option>
			);
		});
	}

	/**
	 * Filter and validate username entries in the form of email address
	 * @param {Object} users - List of users fetched from CF endpoint
	 */
	filterUsers(users) {
		return users
			.filter(item => item.user.username !== undefined)
			.filter(item =>
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
					item.user.username
				)
			);
	}

	/**
	 * Render a list of email templates to <option> keys for a <select> element.
	 * @param {Array} templates -
	 */
	renderTemplates(templates) {
		return templates.map((item, index) => {
			return (
				<option key={index} value={item.id}>
					{item.name}
				</option>
			);
		});
	}

	renderNotifyButton(item) {
		return (
			<button onClick={this.handleNotify.bind(this, item)}>Notify</button>
		);
	}

	renderReportedBuildpacks(buildpack) {
		return (
			<table className="buildpacks">
				<tbody>
					<tr>
						<th>Organization</th>
						<th>Space</th>
						<th>App</th>
						<th>Buildpack</th>
					</tr>
					{buildpack
						.filter(item => {
							return item.messages[0] === "needs attention (5)";
						})
						.map((item, index) => {
							return (
								<tr key={index}>
									<td>{item.organization}</td>
									<td>{item.space}</td>
									<td>{item.application}</td>
									<td>{item.buildpacks}</td>
									<td>{this.renderNotifyButton(item)}</td>
								</tr>
							);
						})}
				</tbody>
			</table>
		);
	}

	render() {
		return (
			<main className="app">
				{/* <form onSubmit={this.handleSubmit}>
					<label>To:</label>
					<select
						name="to"
						onChange={this.handleChange}
						value={this.state.to}
					>
						{this.renderOptionKeys(this.state.users)}
					</select>
					<br />
					<label>
						Template:
					<select
						name="selectedTemplate"
						onChange={this.handleChange}
						value={this.state.selectedTemplate}
					>
						{this.renderTemplates(this.state.templates)}
					</select>
					</label>
					<br />
					<input type="submit" value="Submit" />
				</form> */}
				<h2>Outdated buildpacks</h2>
				<p>
					Given a list of outdated buildpacks, send emails to users
					who are apart of the reported spaces.
				</p>
				{this.renderReportedBuildpacks(this.state.buildpacks)}
			</main>
		);
	}
}

export default App;
