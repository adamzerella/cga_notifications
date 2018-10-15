import React, { Component } from "react";

class App extends Component {
  render() {
    return (
      <main className="App">
        <form>
          <label>
            To:
            <input type="email" name="to" />
          </label>
          <label>
            Subject:
            <input type="text" name="subject" />
          </label>
          <label>
            Message:
            <input type="text" name="message" />
          </label>
          <br />
          <br />
          <input type="submit" value="Submit" />
        </form>
      </main>
    );
  }
}

fetch("http://localhost:4123/v0", {
  method: "GET"
})
  .then(response => console.log(response.json()))
  .catch(err => {
    console.error(err);
  });

export default App;
