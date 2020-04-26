import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import SignInSide from './Login';
import Register from './Register';
import Chat from './Chat';
import CreateChat from './CreateChat';
function App() {
  return (
    <Router>
        <Switch>
          <Route path="/chat/new/">
            <CreateChat/>
          </Route>
          <Route path="/chat/">
            <Chat/>
          </Route>
          <Route path="/register/">
            <Register/>
          </Route>
          <Route path="/">
            <SignInSide/>
          </Route>
        </Switch>
    </Router>
  );
}

export default App;
