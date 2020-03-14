import React from 'react';
import logo from './logo.svg';
import './App.css';
import '@vaadin/vaadin';
import Welcome from './Welcome.js';
import Register from './Register.js';
import Login from './Login.js';
import Chats from './Chats.js';
//import { useAuth } from "./providers/auth-provider"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink
} from "react-router-dom";
function App() {
  //const { user } = useAuth();
  return (
    <Router>
    <div className="App">
<vaadin-app-layout primary-section="drawer">
  <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
  <img slot="navbar" src="logo_small.png" alt="jsCHAT Logo" width="64" height="64"></img>
  <p slot="navbar"></p>
  <vaadin-tabs slot="drawer" orientation="vertical" theme="minimal">
    <vaadin-tab>
    <Link to="/">
      <iron-icon icon="vaadin:home"></iron-icon>
      Home
      </Link>
    </vaadin-tab>
    <vaadin-tab>
    <Link to="/login">
      <iron-icon icon="vaadin:key"></iron-icon>
      Login
      </Link>
    </vaadin-tab>
    <vaadin-tab>
    <Link to="/register">
      <iron-icon icon="vaadin:user"></iron-icon>
      Register
      </Link>
    </vaadin-tab>
  </vaadin-tabs>

  <div className="content">
  
  <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/">
            <Welcome />
          </Route>
        </Switch>
       
  </div>
</vaadin-app-layout>
    </div>
     </Router>
  );
}

export default App;
