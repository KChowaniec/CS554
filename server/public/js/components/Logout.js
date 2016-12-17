import React from 'react'
import auth from '../utils/auth'
import { browserHistory } from 'react-router';

const Logout = React.createClass({
  componentDidMount() {
    auth.logout();
    browserHistory.push('/');
    // var requestConfig = {
    //   method: "GET",
    //   url: "/logout",
    //   contentType: 'application/json'
    // };
    // let react = this;
    // $.ajax(requestConfig).then((responseMessage) => {
    //   if (responseMessage.success) {
    //     react.browserHistory.push('/login');
    //   }
    // });

  },

  render() {
    return <p>You are now logged out</p>
  }
})

export default Logout
