import React from 'react';
import logo from './logo.svg';
import './App.css';
import '@vaadin/vaadin';
class Login extends React.Component{
	render(){
		return(
			<div>
			<main>
  <vaadin-login-form></vaadin-login-form>
</main>
<vaadin-dialog id="feedbackDialog">
  <template>Login is being processed...</template>
</vaadin-dialog>
<vaadin-dialog id="supportDialog">
  <template>Please contact support.</template>
</vaadin-dialog>
</div>
		)
	}
}
export default Login;