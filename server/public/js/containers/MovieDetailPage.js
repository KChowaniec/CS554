import React, { PropTypes } from 'react';
import Movie from '../components/Movie.js';
import axios from 'axios';

class MovieDetailsPage extends React.Component {
    
  
  constructor(props) {
    super(props);

    // set the initial component state
    this.state = {
      error: false,
      movie: {
      }
    };
  }

  componentDidMount() {
    axios.get('/movies/detail/' + this.props.params.id)
      .then(res => {
        this.setState({ movie: res.data});
      });
  }

  render() {
    return (
      <Movie
        error={this.state.error}
        movie={this.state.movie}
        />
    );
  }

}

export default MovieDetailsPage;