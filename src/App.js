import React, { Component } from "react";
import { Helmet } from "react-helmet";
import Head from "./components/Head";
import Map from "./components/Map";
class App extends Component {
  render() {
    return (
      <div className="App">
        <Helmet>
          <Head />
        </Helmet>
        <Map />
      </div>
    );
  }
}

export default App;
