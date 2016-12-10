import React, { PropTypes } from 'react';
import LoginForm from '../components/LoginForm.js';
import { browserHistory } from 'react-router';
import auth from '../utils/auth.js';

class LoginPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props) {
    super(props);

    // set the initial component state
    this.state = {
      error: false,
      user: {
        username: '',
        password: ''
      }
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

    auth.login(username, password, (loggedIn) => {
      console.log(loggedIn);
      if (!loggedIn) {
        return this.setState({ error: true })

      }
      else {
        browserHistory.push('/home');
      }

      //const { location } = this.props

      // if (location.state && location.state.nextPathname) {
      //   this.history.replaceState(null, location.state.nextPathname)
      // } else {
      //   this.history.replaceState(null, '/')
      // }
    });

    // var requestConfig = {
    //   method: "POST",
    //   url: "/user/login",
    //   contentType: 'application/json',
    //   data: JSON.stringify({
    //     username: username,
    //     password: password,
    //   })
    // };
    // let reactThis = this;
    // $.ajax(requestConfig).then((responseMessage) => {
    //   if (responseMessage.success) {
    //     reactThis.setState({
    //       errors: {},
    //       loggedIn: true
    //     });
    //     browserHistory.push('/home'); //redirect to home page upon successful registration
    //   }
    //   else {
    //     const errors = responseMessage.errors ? responseMessage.errors : {};
    //     errors.summary = responseMessage.message;
    //     console.log("login failed");
    //     reactThis.setState({
    //       errors
    //     });
    //   }
    // });
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
        error={this.state.error}
        user={this.state.user}
        />
    );
  }

}

export default LoginPage;