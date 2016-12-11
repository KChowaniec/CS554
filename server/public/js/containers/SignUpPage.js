import React, { PropTypes } from 'react';
import SignUpForm from '../components/SignUpForm.js';
import { browserHistory } from 'react-router';
class SignUpPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props) {
    super(props);

    // set the initial component state
    this.state = {
      errors: false,
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
    const username = encodeURIComponent(this.state.user.username);
    const name = encodeURIComponent(this.state.user.name);
    const email = encodeURIComponent(this.state.user.email);
    const password = encodeURIComponent(this.state.user.password);
    const confirm = encodeURIComponent(this.state.user.confirm);

    auth.register(username, password, confirm, email, name, (loggedIn) => {
      console.log(loggedIn);
      if (!loggedIn) {
        return this.setState({ errors: true })
      }
      else {
        browserHistory.push('/home');
      }
    });
  }

  // var requestConfig = {
  //   method: "POST",
  //   url: "/user/register",
  //   contentType: 'application/json',
  //   data: JSON.stringify({
  //     username: username,
  //     password: password,
  //     name: name,
  //     email: email,
  //     confirm: confirm
  //   })
  // };
  // let reactThis = this;
  // $.ajax(requestConfig).then((responseMessage) => {
  //   if (responseMessage.success) {
  //     reactThis.setState({
  //       errors: {}
  //     });
  //     browserHistory.push('/home'); //redirect to home page upon successful registration
  //   }
  //   else {
  //     console.log("error");
  //     const errors = responseMessage.errors ? responseMessage.errors : {};
  //     errors.summary = responseMessage.message;

  //     reactThis.setState({
  //       errors
  //     });
  //   }
  // });
  //   }

  // Render the component.
  render() {
    return (
      <SignUpForm
        onSubmit={this.processForm}
        onChange={this.changeUser}
        errors={this.state.errors}
        user={this.state.user}
        />
    );
  }

}

SignUpPage.contextTypes = {
  router: PropTypes.object.isRequired
};


export default SignUpPage;