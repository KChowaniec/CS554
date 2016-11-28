import Base from './components/Base.js';
import HomePage from './components/HomePage.js';
import LoginPage from './containers/LoginPage.js';
import SignUpPage from './containers/SignUpPage.js';
import Logout from './components/Logout.js';
//import HomePage from './containers/HomePage.js';

//check if user has logged in
// function requireAuth(nextState, replace) {
//  // console.log(SignUpPage.props);
//   if (!(SignUpPage.loggedIn && LoginPage.loggedIn)) {
//     replace({
//       pathname: '/',
//       state: { nextPathname: nextState.location.pathname }
//     })
//   }
// }

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
    {
      path: '/logout',
      component: Logout
    }

  ]
};

export default routes;