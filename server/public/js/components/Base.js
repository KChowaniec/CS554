import React, { PropTypes } from 'react';
import { Link, IndexLink } from 'react-router';
import auth from '../utils/auth';


const Base = React.createClass({
  getInitialState() {
    return {
      loggedIn: auth.loggedIn()
    }
  },

  updateAuth(loggedIn) {
    this.setState({
      loggedIn: !!loggedIn
    })
  },

  componentWillMount() {
    auth.onChange = this.updateAuth
    auth.login()
  },
  render() {
    return (
      <div>
        <div className="top-bar">
          <div className="top-bar-left">
            <IndexLink to="/">Movie Matrix Search</IndexLink>
          </div>
          <div className="top-bar-right">
            {this.state.loggedIn ? (
              <div>
                <Link to="/account">My Account</Link>
                <Link to="/playlist">My Playlist</Link>
                <Link to="/analytics">Movie Analytics</Link>
                <Link to="/logout">Log out</Link>
              </div>
            ) : (
                <div>
                  <Link to="/login">Login</Link>
                  <Link to="/signup">Sign up</Link>
                </div>
              )}
          </div>

        </div>

        {this.props.children}

      </div>
    );
  }

})

Base.propTypes = {
  children: PropTypes.object.isRequired
};

export default Base;
