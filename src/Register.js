import React from 'react';
import logo from './logo.svg';
import './App.css';
import '@vaadin/vaadin';
class Register extends React.Component{
	componentDidMount() {
		this.refs.registerButton.addEventListener('click', e => {
			fetch("/.netlify/functions/user.create.js",{
				method: 'POST',
				body:JSON.stringify({
					username:this.refs.username.value,
					email:this.refs.email.value,
					password:this.refs.password.value
				})
			}).then(response => {
    alert(response.statusText);
  });
		});
	}
	render(){
		return(
			<main>
			<vaadin-form-layout>
			<h1>Register</h1><br/>
  <vaadin-text-field label="Pick an username" ref="username"></vaadin-text-field>
  <vaadin-email-field label="Email" ref="email"></vaadin-email-field>
  <vaadin-password-field label="Password" ref="password"></vaadin-password-field>
  <vaadin-password-field label="Repeat password" ref="password2"></vaadin-password-field>
  <vaadin-button colspan="2" onclick={this.createUser} ref="registerButton">
  <iron-icon icon="vaadin:arrow-right" slot="suffix"></iron-icon>
  Register
</vaadin-button>
</vaadin-form-layout>

</main>
		)
	}
}
export default Register;