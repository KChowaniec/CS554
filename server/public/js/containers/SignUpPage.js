import React, { PropTypes } from 'react';
import SignUpForm from '../components/SignUpForm.js';
import { browserHistory } from 'react-router';
import auth from '../utils/auth.js';

class SignUpPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props) {
    super(props);

    // set the initial component state
    this.state = {
      error: false,
      errors: {},
      user: {
        username: '',
        name: '',
        email: '',
        password: '',
        confirm: ''
      }
    };

    this.processForm = this.processForm.bind(this);
    this.changeUser = this.changeUser.bind(this);
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
 * Process the form.
 *
 * @param {object} event - the JavaScript event object
 */
  processForm(event) {
    // prevent default action. in this case, action is the form submission event
    event.preventDefault();

    // create a string for an HTTP body message
    const username = this.state.user.username;
    const name = this.state.user.name;
    const email = this.state.user.email;
    const password = this.state.user.password;
    const confirm = this.state.user.confirm;
    let errors = {};
    if (!username) {
      errors.username = "This field is required";
    }
    if (!name) {
      errors.name = "This field is required";
    }
    if (!email) {
      errors.email = "This field is required";
    }
    if (!password) {
      errors.password = "This field is required";
    }
    if (!confirm) {
      errors.confirm = "This field is required";
    }
    if (confirm && password && (confirm != password)) {
      errors.confirm = "The confirmed password must match the original password";
    }
    if (!jQuery.isEmptyObject(errors)) {
      return this.setState({ errors })
    }
    else {
      auth.register(username, password, confirm, email, name, (loggedIn) => {
        if (!loggedIn) {
          return this.setState({ error: true })
        }
        else {
          this.setState({error: false})
          browserHistory.push('/home');
        }
      });
    }
  }


  // Render the component.
  render() {
    return (
      <SignUpForm
        onSubmit={this.processForm}
        onChange={this.changeUser}
        errors={this.state.errors}
        error={this.state.error}
        user={this.state.user}
        />
    );
  }

}

SignUpPage.contextTypes = {
  router: PropTypes.object.isRequired
};


export default SignUpPage;