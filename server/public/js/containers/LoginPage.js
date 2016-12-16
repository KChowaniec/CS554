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
      errors: {},
      error: false,
      user: {
        username: '',
        password: ''
      }
    };
    this.processForm = this.processForm.bind(this);
    this.changeUser = this.changeUser.bind(this);
  }
  componentDidMount() {
    auth.logout();
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
    const username = this.state.user.username;
    const password = this.state.user.password;
    let errors = {};
    if (!username) {
      errors.username = "This field is required";
    }
    if (!password) {
      errors.password = "This field is required";
    }
    if (!jQuery.isEmptyObject(errors)) {
      return this.setState({ errors })
    }
    else {
      auth.login(username, password, (loggedIn) => {
        if (!loggedIn) {
          return this.setState({ error: true })

        }
        else {
          browserHistory.push('/home');
        }

      });
    }
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
        errors={this.state.errors}
        user={this.state.user}
        />
    );
  }

}

export default LoginPage;