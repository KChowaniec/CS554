import Base from './components/Base.js';
import HomePage from './components/HomePage.js';
import LoginPage from './containers/LoginPage.js';
import SignUpPage from './containers/SignUpPage.js';
import Logout from './components/Logout.js';
import { browserHistory } from 'react-router';
import auth from './utils/auth.js';

function redirectToLogin(nextState, replace) {
  if (!auth.loggedIn()) {
    replace('/login')
  }
}

const routes = {
  // base component (wrapper for the whole application).
  component: Base,
  childRoutes: [

    {
      path: '/',
      component: HomePage,
      onEnter: redirectToLogin
    },

    {
      path: '/login',
      component: LoginPage
    },

    {
      path: '/signup',
      component: SignUpPage
    },

    {
      path: '/home',
      component: HomePage,
      onEnter: redirectToLogin
    },
    {
      path: '/logout',
      component: Logout
    },
    //match any other routes - redirect to home page
    {
      path: '/*',
      component: HomePage,
      onEnter: redirectToLogin
    }

  ]
};

export default routes;