import Base from './components/Base.js';
import HomePage from './components/HomePage.js';
import LoginPage from './containers/LoginPage.js';
import SignUpPage from './containers/SignUpPage.js';
//import HomePage from './containers/HomePage.js';

function requireAuth(nextState, replace) {
  if (!userExists()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }
    })
  }
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
    },

  ]
};

export default routes;