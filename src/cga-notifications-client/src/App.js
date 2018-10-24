import React, { Component } from "react";

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
	 * TODO Get users that match org/space for email
	 * Email a static address with a static template to notify of an outdated buildpack.
	 * @param { Object } event - Data from table <tr> { organization: "abc", ... }
	 */
	handleNotify(event) {
		let result = [];
		this.state.users.map(user => {
			result.push({
				user: user.username,
				spaces: this.fetchUserSpaces(user.guid),
			});
		});

		result.map(user => {
			Promise.resolve(user.spaces).then(val => {
				val.filter(ele => {
					return ele.name === event.space;
				});
			});
		});

		// fetch("http://127.0.0.1:4130/v0/notify/buildpack/send", {
		// 	method: "POST",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 	},
		// 	body: JSON.stringify({
		// 		to: "<TODO>",
		// 		templateId: "d5dfe505-fc99-44f8-b147-38b6c096313a",
		// 		buildpack: event,
		// 	}),
		// });
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
			.then(async response => {
				return response.json();
			})
			.catch(err => {
				console.error(err);
			});
	}

	/**
	 * Filter and validate username entries in the form of email address
	 * @param {Array} users - List of users fetched from CF endpoint
	 */
	filterUsers(users) {
		return users
			.filter(item => item.user.username !== undefined)
			.filter(item =>
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
					item.user.username
				)
			)
			.map((ele, index) => {
				return (
					<option key={index} value={ele.user.username}>
						{ele.user.username}
					</option>
				);
			});
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
			<table>
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
						{this.filterUsers(this.state.users)}
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
				{this.renderReportedBuildpacks(this.state.buildpacks)}
			</main>
		);
	}
}

export default App;
