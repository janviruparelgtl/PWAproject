import React, { Component } from 'react'
import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';

class App extends Component {
  
  render() {
    return (
      <div>
        <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <button type="submit" className="btn btn-outline-primary text-light" onClick={e => this.props.history.push('/productList')}>GO TO PRODUCT</button>
        </header>
      </div>
      </div>
    )
  }
}
export default connect(null, null)(App);