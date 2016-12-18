import React, { PropTypes } from 'react';
import Movie from '../components/Movie.js';
import axios from 'axios';

class AnalyticsPage extends React.Component {
    
  
  constructor(props) {
    super(props);

  }

  componentDidMount() {
    document.getElementById("myanalytics").style.height = "1000px";
      
  }

  render() {
    return (
      <iframe src="/analyticss" width="100%" height="100%" style={{border:'none'}} id="myanalytics"></iframe>
    );
  }

}

export default AnalyticsPage;