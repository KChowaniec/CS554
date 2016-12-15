import React from 'react';
import { Card, CardTitle } from 'material-ui/Card';
import { browserHistory, Router, Route, Link, withRouter } from 'react-router'



class Banner extends React.Component {
    constructor(){
        super();
        this.state = {
            item : {}
        };
    }
    
    render() {
        const banner_style = {
            maxWidth: '20%',
            flexGrow : '1'
        };

        return (
            <div className="col-md-3">
            <div className="ca-hover">                   
                <div className="carouselAvatar av4">
                  <div className="carouselImg">
                    <img  src={this.props.item.avatar} alt = {this.props.item.avatar} />
                  </div>
                </div>
                <div className="carouselContent">
                    <h3>{this.props.item.original_title}</h3>
                    <p>{this.props.item.overview}</p>
                </div>
                <div className="overlay"></div>
            </div>
            </div>
        )
    }
}

class Banners extends React.Component {
    constructor(){
        super();
        this.state = {
            playlist : []
        };
    }
    changeplaylist(_playlist){
      console.log('In changeplaylist');
      console.log('New Playlist : ' + JSON.stringify(_playlist));
        this.setState({playlist : _playlist});
    }
    render() {
        //const playlist = [];
        return ( 
            
            <div className ="container carousel flexcontainer">
                <div className="row">
                    {this.props.playlist.map(function(item_element) {
                        return <Banner item={item_element}/>;
                    })}
                </div>
            </div>
        );
    }
}

class SearchBar extends React.Component {
    
    constructor(props) {
        super(props);

        // set the initial component state
        this.state = {
            errors: {},
            data :[],
            parameters: {
                movie: '',
                actor: '',
                director:'',
                genre:''
            }
        };
        this.handleMovieNameChange = this.handleMovieNameChange.bind(this);
        this.handleActorChange = this.handleActorChange.bind(this);
        this.handleDirectorChange = this.handleDirectorChange.bind(this);
        this.handleGenreChange = this.handleGenreChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleMovieNameChange(event) {
        //console.log('@ search bar : handleChange');
        
        const field = 'movie';
        //console.log('@ search bar : target property : ' + field);
        const parameters = this.state.parameters;
        //console.log('@ search bar : value : ' + event.target.value);
        parameters[field] = event.target.value;

        this.setState({parameters});
    }

    handleActorChange(event) {
        //console.log('@ search bar : handleChange');
        
        const field = 'actor';
        //console.log('@ search bar : target property : ' + field);
        const parameters = this.state.parameters;
        //console.log('@ search bar : value : ' + event.target.value);
        parameters[field] = event.target.value;

        this.setState({parameters});
    }
    
    handleDirectorChange(event) {
        //console.log('@ search bar : handleChange');
        
        const field = 'director';
        //console.log('@ search bar : target property : ' + field);
        const parameters = this.state.parameters;
        //console.log('@ search bar : value : ' + event.target.value);
        parameters[field] = event.target.value;

        this.setState({parameters});
    }
    
    handleGenreChange(event) {
        //console.log('@ search bar : handleChange');
        
        const field = 'genre';
        //console.log('@ search bar : target property : ' + field);
        const parameters = this.state.parameters;
        //console.log('@ search bar : value : ' + event.target.value);
        parameters[field] = event.target.value;

        this.setState({parameters});
    }

    applyfilter(playlist){
        var parameters = this.state.parameters;
        var filtered_datasource = [];
        if(parameters.movie){

            playlist.forEach(function(movie) {
                if(toString(movie.original_title).toLowerCase() == toString(parameters.movie).toLowerCase())
                    filtered_datasource.push(movie);
            }, this);
            
        }else{

        }
        return filtered_datasource;
    }

    handleSubmit(event) {

        event.preventDefault();
        var params = {
            title : this.state.parameters.movie
        };
        console.log('Getting query search : ' + JSON.stringify(params));
        var _url = "/search?";
        _url += params.title ? ("title=" +params.title) +"&" : "";
        
        var getQueryStr = {
            url: _url,
            method: "GET",
            contentType: "application/json; charset=utf-8"
        };
        var react_com = this;
        $.ajax(getQueryStr).then(function(response){
            console.log(' ************* Query String  ************** ');
            
            
            if(response.success){
                var qry_str = "/search/results/1?" + response.query;
                console.log(qry_str);
                var getSearch_result = {
                    url : qry_str,
                    method :"GET",
                    contentType : "application/json"
                };
                $.ajax(getSearch_result).then(function(res){
                    console.log('Movies : ' + JSON.stringify(res));
                    
                    react_com.setState({
                        data : res.movies
                    });
                },function(err2){
                    console.log('Error  : ' + JSON.stringify(err2));    
                });
            }else{
                console.log('Error  : ' + JSON.stringify(response.error));
            }
            
        },function(err){
            console.log('Error : ' + JSON.stringify(err));
        })
        /*
        
        var query_str = {
            movie : this.state.parameters.movie,
            actor : this.state.parameters.actor,
            director : this.state.parameters.director,
            genre : this.state.parameters.genre
        };
        var get_myPL = {
            url: "/results/0",
            method: "GET",
            contentType: "application/json"

        };
        var react_comp = this;
        $.ajax(get_myPL).then(function(response) {
        console.log("handleSubmit : " + JSON.stringify(response));
            //console.log('User Info : ' + JSON.stringify(response));
            var data = response;
            console.log("Playlist from Server : " + data);
            
            // following has to be uncommented 
            //this.setState({ data : data });
            this.setState({data : playlist_fake});
        },function(err){
        console.log("handleSubmit : " + err);
        console.log("error : " + err);
        react_comp.setState({
            data : []
            });
        });*/
    }
    
    
    render(){

        console.log('rendering search bar');
        return (
            <div>
                <div className="container">
                    <form 
                      onSubmit={this.handleSubmit} id="search" >
                        <div class="form-group">
                            <label>Movie :</label>
                            <input
                                class="form-control"
                                type="text" 
                                placeholder="Movie" value={this.state.parameters.movie} 
                                onChange={this.handleMovieNameChange} />
                        </div>
                        <div class="form-group">
                            <label>Actor :</label> 
                            <input type="text" 
                            class="form-control"
                            placeholder="Actor" value={this.state.parameters.actor} 
                                onChange={this.handleActorChange}/>
                        </div>
                        <div class="form-group">
                            <label>Director :</label> 
                            <input type="text" 
                            class="form-control"
                            placeholder="Director" value={this.state.parameters.director} 
                                onChange={this.handleDirectorChange} />
                        </div>
                        <div class="form-group">
                            <label>Genre :</label> 
                            <input type="text" 
                            class="form-control"
                            placeholder="Genre" value={this.state.parameters.genre} 
                                onChange={this.handleGenreChange} />
                        </div>
                        <div class="form-group"> 
                            <input type="submit" placeholder="Search" />
                        </div>
                        
                    </form>
                </div>
                <div>
                    <Banners playlist={this.state.data}/>
                </div>
            </div>
        );
    }
}

const HomePage =  withRouter(React.createClass({ 
  api:"e443ee14fb107feee75db8b448e6a13e",
  getInitialState: function() {
		return {data: [], mounted: false};
	},
  // getInitialState : function() {
  //   console.log('Initial State');
  //   return {title : "Title is Null"}
  // },
  // <Banners playlist={this.state.data}/>);
  componentWillReceiveProps : function(nextProps){
    
	this.setState({ mounted: false });
  },
  componentDidMount : function(){
    
	this.setState({ mounted: true });
  },
  

  render: function(){  
    console.log('In Home Page Component');
    // return (<Card className="container">
    //           <CardTitle title={this.state.title} subtitle="This is the home page." />
    //         </Card>  );
    //return ( <Banners playlist={playlist_fake}/>);
    //if(this.state.data) {
    return (<div>
                <SearchBar />
            </div>);
    //}
  }
}
));


var playlist_fake = [{
      poster_path: "/9O7gLzmreU0nGkIB6K3BsJbzvNv.jpg",
      adult: false,
      overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his integrity and unquenchable sense of hope.",
      "release_date": "1994-09-10",
      genre_ids: [
        18,
        80
      ],
      id: 278,
      original_title: "The Shawshank Redemption",
      original_language: "en",
      title: "The Shawshank Redemption",
      backdrop_path: "/xBKGJQsAIeweesB79KC89FpBrVr.jpg",
      popularity: 8.301492,
      vote_count: 5636,
      video: false,
      vote_average: 8.4
    },{
      poster_path: "/jLRllZsubY8UWpeMyDLVXdRyEWi.jpg",
      adult: false,
      overview: "The short centers on a young sandpiper, the eponymous Piper, who is afraid of the water. She meets a young hermit crab who \"teaches her the way of the waves\".",
      "release_date": "2016-06-16",
      genre_ids: [
        10751,
        16
      ],
      id: 399106,
      original_title: "Piper",
      original_language: "en",
      title: "Piper",
      backdrop_path: "/w1WqcS6hT0PUWC3adG37NSUOGX5.jpg",
      popularity: 3.233301,
      vote_count: 118,
      video: false,
      vote_average: 8.3
    }] 

export default HomePage;