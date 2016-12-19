import Base from './components/Base.js';
import HomePage from './components/HomePage.js';
import Playlist from './components/Playlist.js';
import MovieDetailsPage from './containers/MovieDetailPage.js';
import LoginPage from './containers/LoginPage.js';
import SignUpPage from './containers/SignUpPage.js';
import AnalyticsPage from './containers/AnalyticsPage.js';
import Logout from './components/Logout.js';
import { browserHistory } from 'react-router';
import auth from './utils/auth.js';
import PreferencePage from './containers/PreferencePage'
import AccountPage from './containers/AccountPage';
import axios from 'axios';


function redirectToLogin(nextState, replace, callback) {
  axios.get('/user/authorized').then(res => {
    let data = res.data;
    if (!data.authorized || !auth.loggedIn()) {
      auth.logout();
      browserHistory.push('/login');
      callback();
    }
    else {
      callback();
    }
  });
}

function replaceWithHome(nextState, replace) {

  replace('/home');
}

const routes = {
  // base component (wrapper for the whole application).
  component: Base,
  childRoutes: [

    {
      path: '/',
      onEnter: replaceWithHome
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
      path: '/playlists',
      component: Playlist,
      onEnter: redirectToLogin
    },
    {
      path: '/movie/:id',
      component: MovieDetailsPage,
      onEnter: redirectToLogin
    },
    {
      path: '/logout',
      component: Logout
    },
    {
      path: '/analytics',
      component: AnalyticsPage
    },
    {
      path: '/account',
      component: AccountPage,
      onEnter: redirectToLogin
    },

    {
      path: '/preference',
      component: PreferencePage
    },

    //match any other routes - redirect to home page
    {
      path: '/*',
      onEnter: replaceWithHome
    }

  ]
};

export default routes;
