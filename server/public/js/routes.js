import Base from './components/Base.js';
import HomePage from './components/HomePage.js';
import LoginPage from './containers/LoginPage.js';
import SignUpPage from './containers/SignUpPage.js';
import Logout from './components/Logout.js';
import { browserHistory } from 'react-router';
//import HomePage from './containers/HomePage.js';

//check if user has logged in
function requireAuth(nextState, replace) {
  $.ajax({
    url: "/user/authorized",
    dataType: 'json',
    cache: false,
    success: function (authorized) {
    },
    error: function (xhr, status, err) {
      browserHistory.push('/');  //redirect to login
    }
  });
}


const routes = {
  // base component (wrapper for the whole application).
  component: Base,
  childRoutes: [

    {
      path: '/',
      component: LoginPage
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
      onEnter: requireAuth
    },
    {
      path: '/logout',
      component: Logout
    },
    //match any other routes - redirect to login page
    {
      path: '/*',
      component: HomePage,
      onEnter: requireAuth
    }

  ]
};

export default routes;