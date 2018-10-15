import React, { Component } from "react";

class App extends Component {
	constructor(props) {
		super(props);

		this.state = { users: [], to: "", subject: "", message: "" };
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleMessageChange = this.handleMessageChange.bind(this);
		this.handleSubjectChange = this.handleSubjectChange.bind(this);
		this.handleToChange = this.handleToChange.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
	}

	handleMessageChange(event) {
		event.preventDefault();
		this.setState({ message: event.target.value })
	}

	handleSubjectChange(event) {
		event.preventDefault();
		this.setState({ subject: event.target.value })
	}

	handleToChange(event) {
		event.preventDefault();
		this.setState({ to: event.target.value })
	}

	async componentDidMount() {
		this.setState({ users: await this.fetchUsers() });
	}

	fetchUsers() {
		return fetch("http://127.0.0.1:4123/v0/cf/users", {
			method: "GET",
		})
			.then(response => {
				return response.json();
			})
			.catch(err => {
				console.error(err);
			});
	}

	render() {
		return (
			<main className="app">
				<form onSubmit={this.handleSubmit}>
					<label>To:</label>
					<select
						value={this.state.to}
						onChange={this.state.handleToChange}
					>
						{this.state.users.map((ele, index) => (
							<option key={index}>{ele.user.username}</option>
						))}
					</select>
					<br />
					<label>
						Subject:
						<input
							type="text"
							value={this.state.subject}
							onChange={this.handleSubjectChange}
							name="subject"
						/>
					</label>
					<br />
					<label>
						Message:
						<textarea
							type="text"
							onChange={this.state.handleMessageChange}
							name="message"
						/>
					</label>
					<br />
					<input type="submit" value="Submit" />
				</form>
			</main>
		);
	}
}

export default App;
