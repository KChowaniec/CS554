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
            <p>Matrix Movie Search</p>
          </div>
          <div className="top-bar-right">
            {this.state.loggedIn ? (
              <Link to="/logout">Log out</Link>
            ) : (
                <Link to="/signup">Sign up</Link>
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

// const App = React.createClass({

//   getInitialState() {
//     return {
//       loggedIn: auth.loggedIn()
//     }
//   },

//   updateAuth(loggedIn) {
//     this.setState({
//       loggedIn: !!loggedIn
//     })
//   },

//   componentWillMount() {
//     auth.onChange = this.updateAuth
//     auth.login()
//   },

//   render() {
//     return (
//       <div>
//         <ul>
//           <li>
//             {this.state.loggedIn ? (
//               <Link to="/logout">Log out</Link>
//             ) : (
//                 <Link to="/login">Sign in</Link>
//               )}
//           </li>
//           <li><Link to="/about">About</Link></li>
//           <li><Link to="/">Home</Link> (changes depending on auth status)</li>
//           <li><Link to="/page2">Page Two</Link> (authenticated)</li>
//           <li><Link to="/user/foo">User: Foo</Link> (authenticated)</li>
//         </ul>
//         {this.props.children}
//       </div>
//     )
//   }

// })

// export default App
