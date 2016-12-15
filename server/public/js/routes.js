import Base from './components/Base.js';
import HomePage from './components/HomePage.js';
import MovieDetailsPage from './containers/MovieDetailPage.js';
import LoginPage from './containers/LoginPage.js';
import SignUpPage from './containers/SignUpPage.js';
import AnalyticsPage from './containers/AnalyticsPage.js';
import Logout from './components/Logout.js';
import { browserHistory } from 'react-router';
import auth from './utils/auth.js';
import Playlist from './components/Playlist.js';
// import HomePage from './containers/HomePage.js';

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

function getMovieById(nextState, replace) {
  var requestConfig = {
    method: "GET",
    url: "/detail/5",
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
      component: AnalyticsPage,
      onEnter: getAnalytics
    },
    {
      path: '/detailm',
      onEnter: getMovieById
    },
    {
      path: '/myplaylist',
      component: Playlist
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