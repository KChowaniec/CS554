import React, { PropTypes } from 'react';
import Movie from '../components/Movie.js';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';


class MovieDetailsPage extends React.Component {


  constructor(props) {
    super(props);

    // set the initial component state
    this.state = {
      error: false,
      movie: {
      },
      recs: [],
      reviews: [],
      internalReviews: [{_id:12345,comment:"",name:""}],
      errorText:'',
      errorVisibility: false,
    };
    this.addReview = this.addReview.bind(this);
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
    axios.get('/movies/allreviews/' + this.props.params.id)
      .then(res => {
        if (res.data.length > 0) {
            this.setState({ internalReviews: res.data});
        }
        else {
            document.getElementById("intReviewsTitle").style.display = "none";
        }
      });
  }

   addReview () {
        axios.post('/movies/reviews/add/',{movieId:this.state.movie._id,review:document.getElementById("review").value})
            .then(res => {
                if (res.data.success)
                {
                    // alert("Your review has been added!");
                    this.setState({errorVisibility:true});
                    this.setState({errorText:'Your review has been added!'});
                    var idtmp = new Date();
                    if (this.state.internalReviews[0]._id == 12345){
                        this.state.internalReviews = [];
                    }
                    this.state.internalReviews.push({key:idtmp.getTime(),name:decodeURI(res.data.result.name),comment:document.getElementById("review").value});
                    this.setState({internalReviews:this.state.internalReviews});
                    document.getElementById("intReviewsTitle").style.display = "inline";
                }
                else{
                    alert(res.data.error);
                }
            });
    }

  render() {
    return (
        <div>
          <Movie
            error={this.state.error}
            movie={this.state.movie}
            recs={this.state.recs}
            reviews={this.state.reviews}
            intreviews={this.state.internalReviews}
            addReview={this.addReview}
            />
          <Snackbar
          open={this.state.errorVisibility}
          message={this.state.errorText}
          autoHideDuration={4000}
              />
        </div>
    );
  }

}

export default MovieDetailsPage;
