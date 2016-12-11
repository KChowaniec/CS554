import Base from './components/Base.js';
import HomePage from './components/HomePage.js';
import LoginPage from './containers/LoginPage.js';
import SignUpPage from './containers/SignUpPage.js';
import AnalyticsPage from './containers/AnalyticsPage.js';
import Logout from './components/Logout.js';
import { browserHistory } from 'react-router';
import auth from './utils/auth.js';

function redirectToLogin(nextState, replace) {
  if (!auth.loggedIn()) {
    replace('/login')
  }
}

function getAnalytics(nextState, replace) {
  var requestConfig = {
    method: "GET",
    url: "/analytics",
    contentType: 'application/json'
  };
  $.ajax(requestConfig).then((responseMessage) => {
    window.location.reload();
  });
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
    {
      path: '/analytics',
      component: AnalyticsPage,
      onEnter: getAnalytics
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