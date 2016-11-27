import React, { PropTypes } from 'react';
import LoginForm from '../components/LoginForm.js';


class LoginPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props) {
    super(props);

    // set the initial component state
    this.state = {
      errors: {},
      user: {
        username: '',
        password: ''
      },
      loggedIn: false
    };

    this.processForm = this.processForm.bind(this);
    this.changeUser = this.changeUser.bind(this);
  }

  /**
   * Process the form.
   *
   * @param {object} event - the JavaScript event object
   */
  processForm(event) {
    // prevent default action. in this case, action is the form submission event
    event.preventDefault();

    // create a string for an HTTP body message
    const username = encodeURIComponent(this.state.user.username);
    const password = encodeURIComponent(this.state.user.password);
   // const formData = `username=${username}&password=${password}`;

 var requestConfig = {
    method: "POST",
    url: "/user/login",
    contentType: 'application/json',
    data: JSON.stringify({
      username: username,
      password: password,
    })
  };
let reactThis = this;
  $.ajax(requestConfig).then((responseMessage) => {
    if (responseMessage.success) {
      reactThis.setState({
        errors: {},
        loggedIn: true
      });
      browserHistory.push('/home'); //redirect to home page upon successful registration
    }
    else {
      const errors = responseMessage.errors ? responseMessage.errors : {};
      errors.summary = responseMessage.message;

      reactThis.setState({
        errors
      });
    }
  });
  }

  /**
   * Change the user object.
   *
   * @param {object} event - the JavaScript event object
   */
  changeUser(event) {
    const field = event.target.name;
    const user = this.state.user;
    user[field] = event.target.value;

    this.setState({
      user
    });
  }

  /**
   * Render the component.
   */
  render() {
    return (
      <LoginForm
        onSubmit={this.processForm}
        onChange={this.changeUser}
        errors={this.state.errors}
        user={this.state.user}
      />
    );
  }

}

export default LoginPage;