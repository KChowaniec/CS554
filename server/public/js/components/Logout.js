import React from 'react'
import auth from '../utils/auth'
import { browserHistory } from 'react-router';

const Logout = React.createClass({
  componentDidMount() {
    auth.logout()
    browserHistory.push('/');
  },

  render() {
    return <p>You are now logged out</p>
  }
})

export default Logout
