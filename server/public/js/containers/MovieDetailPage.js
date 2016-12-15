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
      },
      recs: [],
      reviews: []
    };
  }

  componentDidMount() {
    axios.get('/movies/detail/' + this.props.params.id)
      .then(res => {
        this.setState({ movie: res.data});
      });
    axios.get('/movies/recommendations/' + this.props.params.id)
      .then(res => {
        this.setState({ recs: res.data.results});
      });
    axios.get('/movies/reviews/' + this.props.params.id)
      .then(res => {
        this.setState({ reviews: res.data.results});
      });
  }

  render() {
    return (
      <Movie
        error={this.state.error}
        movie={this.state.movie}
        recs={this.state.recs}
        reviews={this.state.reviews}
        />
    );
  }

}

export default MovieDetailsPage;