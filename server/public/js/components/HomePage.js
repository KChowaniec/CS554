import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import { browserHistory, Router, Route, Link, withRouter } from 'react-router'
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import DeleteForever from 'material-ui/svg-icons/action/delete-forever';
import axios from 'axios';
import RaisedButton from 'material-ui/RaisedButton';
import PlaylistAdd from 'material-ui/svg-icons/av/playlist-add';
import PlaylistAddCheck from 'material-ui/svg-icons/av/playlist-add-check';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const genres = [
    {
        textKey: 'Action',
        valueKey: 28
    },
    {
        textKey:'Adventure',
        valueKey: 12
    },
    {
        textKey:'Animation',
        valueKey: 16
    },
    {
        textKey:'Comedy',
        valueKey: 35
    },
    {
        textKey:'Crime',
        valueKey: 80
    },
    {
        textKey:'Documentary',
        valueKey: 99
    },
    {
        textKey:'Drama',
        valueKey: 18
    },
    {
        textKey:'Family',
        valueKey: 10751
    },
    {
        textKey:'Fantasy',
        valueKey: 14
    },
    {
        textKey:'Foreign',
        valueKey: 10769
    },
    {
        textKey:'History',
        valueKey: 36
    },
    {
        textKey:'Horror',
        valueKey: 27
    },
    {
        textKey:'Music',
        valueKey: 10402
    },
    {
        textKey:'Mystery',
        valueKey: 9648
    },
    {
        textKey:'Romance',
        valueKey: 10749
    },
    {
        textKey:'Science Fiction',
        valueKey: 878
    },
    {
        textKey:'TV Movie',
        valueKey: 10770
    },
    {
        textKey:'Thriller',
        valueKey: 53
    },
    {
        textKey:'War',
        valueKey: 10752
    },
    {
        textKey:'Western',
        valueKey: 37
    }
];

const dataSourceConfig = {
  text: 'textKey',
  value: 'valueKey',
};

class SearchBar extends React.Component {
    
    constructor(props) {
        super(props);

        // set the initial component state
        this.state = {
            GenreSelected : false,
            errors: {},
            data :[],
            styles: {

                titleStyle: {
                    color: 'rgb(0, 0, 0)',
                    fontWeight: 'bold'
                },
                root: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
                },
                gridList: {
                    display: 'flex',
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                },
              imageStyle: {
                    height: '200px',
                    width: '200px',
                }
            },
            parameters: {
                movie: '',
                actor: '',
                director:'',
                genre:''
            },
            currentPage: 1,
            customWidth: {
                width: 150,
            }
        };
        
        this.handleMovieNameChange = this.handleMovieNameChange.bind(this);
        this.handleActorChange = this.handleActorChange.bind(this);
        this.handleCrewChange = this.handleCrewChange.bind(this);
        this.handleGenreChange = this.handleGenreChange.bind(this);
        this.handleKeywordChange = this.handleKeywordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    itemClicked(id) {
        //console.log("itemClicked Clicked");
        if (id !== "next") {
            //console.log("Item Clicked: " + id);
            browserHistory.push('/movie/' + id);
        } else{
            //console.log("Next Clicked");
            this.getQueryStr_Movies(true);
        }
    }

    additem(index){
        if (!this.state.data[index].isAdded) {
            //console.log("Add Movie Clicked "+this.state.data[index].id);
            var react_component = this;
            var movie_index = index;
            //console.log('Movie is going to be added : ' + this.state.data[index].id);
            axios.post('/playlist/addmovie' + this.state.data[index].id)
                .then(res => {
                    if (res.data.success === true) {
                        console.log("Movie Added");
                         //[movie_index].isAdded = true;
                         var arr_search = react_component.state.data;
                         arr_search[movie_index].isAdded = true;
                          react_component.setState({
                              data : arr_search
                          });
                        alert("Success : Movie added.");
                    }else{
                        console.log("Movie NOT Added");
                        alert("There was some problem in adding movie to the playlist.");
                    }
                });
        }else{
            alert("Movie Already Added");
        }
    }

    handleMovieNameChange(event) {
        //console.log('@ search bar : handleChange');
        this.setState({
            currentPage : 1
        });
        const field = 'movie';
        //console.log('@ search bar : target property : ' + field);
        const parameters = this.state.parameters;
        //console.log('@ search bar : value : ' + event.target.value);
        parameters[field] = event.target.value;

        this.setState({parameters});
    }

    handleActorChange(event) {
        //console.log('@ search bar : handleChange');
        this.setState({
            currentPage : 1
        });
        const field = 'actor';
        //console.log('@ search bar : target property : ' + field);
        const parameters = this.state.parameters;
        //console.log('@ search bar : value : ' + event.target.value);
        parameters[field] = event.target.value;

        this.setState({parameters});
    }
    
    handleCrewChange(event) {
        //console.log('@ search bar : handleChange');
        this.setState({
            currentPage : 1
        });
        const field = 'crew';
        //console.log('@ search bar : target property : ' + field);
        const parameters = this.state.parameters;
        //console.log('@ search bar : value : ' + event.target.value);
        parameters[field] = event.target.value;

        this.setState({parameters});
    }

    handleKeywordChange(event){
        this.setState({
            currentPage : 1
        });
        const field = 'keywords';
        //console.log('@ search bar : target property : ' + field);
        const parameters = this.state.parameters;
        //console.log('@ search bar : value : ' + event.target.value);
        parameters[field] = event.target.value;

        this.setState({parameters});
    }

    handleGenreChange(event, index, value) {
        //console.log('@ search bar : handleChange');
        this.state.GenreSelected = true;
        this.setState({
            currentPage : 1
        });
        const field = 'genre';
        //console.log('Genre changed : ' + value);
        //console.log('Genre changed : ' + index);
        const parameters = this.state.parameters;
        //console.log('@ search bar : value : ' + event.target.value);
        parameters[field] = value;

        this.setState({parameters});
    }

    
    applyfilter(playlist, searchResult){
        
        var ids = [];
        var filter_indexes = [];
        
        //console.log('Playlist Ids : ' + ids);
        var index = 0;
        var isFound = false;
        
        //console.log('Pre Filter');
        searchResult.forEach(function(element) {
            //if(element.title == "300")
                //console.log('Id: ' + element.id + ' title' + element.title+ ' isAdded' + element.isAdded);
        }, this);

        var counter = 0;
        searchResult.forEach(function(search_item) {
            //console.log('id : ' + element.id + 'is in ids array @ : ' + ids.indexOf(element.id));
            playlist.forEach(function(pl_item) {
                //console.log('Search Item id : ' + search_item.id + " is compared with pl item id : " + pl_item._id + ' and the result is : ' + search_item.id == pl_item._id );
                if(search_item.id == pl_item._id)
                    filter_indexes.push(counter);
            }, this);
            counter++;
        }, this);

        filter_indexes.forEach(function(index) {
            searchResult[index].isAdded = true; 
        }, this);

        //console.log('filtered Indexes : ' + filter_indexes);
        //console.log('Post Filter');
        searchResult.forEach(function(element) {
            //if(element.title == "300")
                //console.log('Id: ' + element.id + ' title' + element.title+ ' isAdded' + element.isAdded);
        }, this);
        return searchResult;
    }

    
    getQueryStr_Movies(isNextOperation){
        var myplayList = [];
        var get_playlist = {
            url : "/playlist",
            method : "GET",
            contentType: "application/json; charset=utf-8"
        };

        $.ajax(get_playlist).then(function(res){
            myplayList = res;            
        },function(err){
            console.log("error while getting user playlist : " + JSON.stringify(err));
        });
        let title = this.state.parameters.movie;
        
        let actors = this.state.parameters.actor;
        
        if(!isNaN(this.state.parameters.genre))
            alert('Selected : ' + this.state.parameters.genre);
        else
            alert('Not Selected : ');

        var genres = !isNaN(this.state.parameters.genre) ? [this.state.parameters.genre] : [];
        //alert(genres);
        var crew = this.state.parameters.crew;
        
        var keywords = this.state.parameters.keywords;

        var parseActors = [];
        var parseWords = [];
        var parseGenre = genres;
        var parseCrew = [];       

        if (actors) {
            parseActors = actors.split(',');
            if (parseActors.length == 0) {
                parseActors.push(actors);
            }
        }

        if (crew) {
            parseCrew = crew.split(',');
            if (parseCrew.length == 0) {
                parseCrew.push(crew);
            }
        }

        if (keywords) {
            parseWords = keywords.split(',');
            if (parseWords.length == 0) {
                parseWords.push(keywords);
            }
        }
       
        var getQueryStr = {
            method: "POST",
            url: "search/",
            contentType: 'application/json',
            data: JSON.stringify({
                title: title,
                parseActors: parseActors,                
                parseGenre: parseGenre,
                parseWords: parseWords,                
                parseCrew: parseCrew
            })
        };
        var react_com = this;
        $.ajax(getQueryStr).then(function(response){
            if(response.success){
                var page_index = isNextOperation ? react_com.state.currentPage +1 : react_com.state.currentPage;
                react_com.setState({ currentPage : page_index});

                var qry_str = "/search/results/"+ page_index + "?" + response.query;
                console.log(' ************* Query String  ************** ');
                console.log(qry_str);
                console.log(' ************* Query String  ************** ');
                var getSearch_result = {
                    url : qry_str,
                    method :"GET",
                    contentType : "application/json"
                };
                $.ajax(getSearch_result).then(function(res){
                    //console.log('Movies : ' + JSON.stringify(res));
                    var newArr = res.movies ? res.movies : [];
                    newArr = react_com.applyfilter(myplayList, newArr);
                    console.log(newArr);
                    var page = parseInt(res.page);
                    var totalPages = parseInt(res.total);
                    if ((totalPages - page) > 0) {
                        //react_com.setState({ currentPage: page });
                        if(newArr && newArr.length > 0)
                            newArr.push({
                                id: "next",
                                poster_path: "/public/images/next.png",
                                title: "Load More"
                            });
                    }
                    if(isNextOperation){
                        console.log('Next Movie operation');
                        
                        var exsisting_movies = react_com.state.data;
                        var final_movie_list = [];
                        console.log('Old movie Count' + exsisting_movies.length);
                        console.log('New movie Count' + newArr.length);
                        exsisting_movies.forEach(function(exsisting_item) {
                            if(exsisting_item.id != 'next')
                                final_movie_list.push(exsisting_item);
                        }, this); 
                        newArr.forEach(function(new_item) {
                            final_movie_list.push(new_item);
                        }, this);
                        newArr = final_movie_list;
                    }
                    react_com.setState({
                        data : newArr
                    });
                },function(err2){
                    console.log('Get query string returned error  : ' + JSON.stringify(err2));    
                });
            }else{
                console.log('Error  : ' + JSON.stringify(response.error));
            }
            
        },function(err){
            console.log('Error in getting query string : ' + JSON.stringify(err));
        });
    }

    handleSubmit(event) {   

        event.preventDefault();
        this.getQueryStr_Movies(false);
        // *************************************************
        

        // $.ajax(requestConfig).then(function (response) {
        //     alert('data : ' + JSON.stringify(response));
        // });

    }
    
    
    
    componentWillReceiveProps (nextProps){
        this.setState({ mounted: false });
    }

    mergeArray(array){
        var result = '';
        for(var i=0;i<array.length;i++){
            result += array[i] + ',';
        }
        result = result.charAt(result.length-1) == ',' ? result.substr(0,result.length -1) : result;
        return result;
    }

    componentDidMount(){
        this.setState({ mounted: true });
        console.log('Gonning to get user preferences');
        var getuser_pref = {
            url : "/user",
            method : "GET",
            contentType: "application/json; charset=utf-8"
        };
        var react_component = this;
        $.ajax(getuser_pref).then(function(res){
            console.log('server returned preference with : ' + JSON.stringify(res));
            if(res.user && res.user.preferences){
                var pref = res.user.preferences;
                //
                var _movies = pref.Title ?  react_component.mergeArray(pref.Title) : ''; 
                var _actors = pref.Actor ? react_component.mergeArray(pref.Actor) : '';
                
                var _crew = pref.Crew ? react_component.mergeArray(pref.Crew) : '';
                var _years = pref.releaseYear ? react_component.mergeArray(pref.releaseYear) : '';
                var _ageratings = pref.ageRating ? react_component.mergeArray(pref.ageRating) : '';
                var _directors = pref.director ? react_component.mergeArray(pref.director) : '';
                var _keywords = pref.keywords ? react_component.mergeArray(pref.keywords) : '';
                
                // ***************************************************************
                // var _genre = pref.Genre ? genres.filter(x=>{
                //     x.textKey == pref.Genre[0]
                // })[0] : genres[0];
                var _genre = genres[0];
                // ***************************************************************
                var user_params =  {
                    movie: _movies,
                    actor: _actors,
                    director:_directors,
                    genre:_genre,
                    keywords : _keywords,
                    ageRating : _ageratings,
                    years : _years,
                    crew : _crew 
                };
                
                react_component.setState({
                    parameters : user_params
                })
            }
        },function(err){
            console.log('server returned error with : ' + err);
        })
        
    }
    
    render(){
        //console.log('rendering search bar');
        return (
            <div>
                <Card className="container">
                    <form onSubmit={this.handleSubmit} id="search" >
                        <h2 className="card-heading">Matrix Search</h2>
                        <div className="field-line">
                            <TextField
                                floatingLabelText="Movie Name"
                                name="title"
                                type="text" 
                                value={this.state.parameters.movie} 
                                onChange={this.handleMovieNameChange} />
                        </div>
                        <div className="field-line">
                            <TextField  
                                floatingLabelText="Actor"
                                name="actor"
                                type="text" 
                                value={this.state.parameters.actor} 
                                onChange={this.handleActorChange}/>
                        </div>
                        <div className="field-line">
                            <TextField 
                                type="text" 
                                name="crew"
                                floatingLabelText="Crew"
                                value={this.state.parameters.crew} 
                                onChange={this.handleCrewChange} />
                        </div>
                        <div className="field-line"> 
                            <TextField 
                                type="text" 
                                name="keywords"
                                floatingLabelText="Keywords" 
                                value={this.state.parameters.keywords} 
                                onChange={this.handleKeywordChange} />
                        </div>
                        <div className="field-line">
                            <SelectField
                                floatingLabelText="Genre"
                                value={this.state.parameters.genre}
                                onChange={this.handleGenreChange}>
                                <MenuItem value={28} primaryText="Action" />
                                <MenuItem value={12} primaryText="Adventure" />
                                <MenuItem value={16} primaryText="Animation" />
                                <MenuItem value={35} primaryText="Comedy" />
                                <MenuItem value={80} primaryText="Crime" />
                                <MenuItem value={99} primaryText="Documentary" />
                                <MenuItem value={10751} primaryText="Family" />
                                <MenuItem value={14} primaryText="Fantasy" />
                                <MenuItem value={10769} primaryText="Foreign" />
                                <MenuItem value={27} primaryText="Horror" />
                                <MenuItem value={10402} primaryText="Music" />
                                <MenuItem value={9648} primaryText="Mystery" />
                                <MenuItem value={10749} primaryText="Romance" />
                                <MenuItem value={878} primaryText="Science Fiction" />
                                <MenuItem value={10770} primaryText="TV Movie" />
                                <MenuItem value={53} primaryText="Thriller" />
                                <MenuItem value={10752} primaryText="War" />
                                <MenuItem value={37} primaryText="Western" />
                            </SelectField>
                        </div>
                        <div className="button-line">
                           <RaisedButton type="submit" label="Submit" primary />
                            <CardText>Save this Search? <RaisedButton type="button" label="Save" secondary /></CardText>
                        </div>
                        
                    </form>
                </Card>
                <div>
                    <div style={this.state.styles.root}>
                        <GridList className="container" style={this.state.styles.gridList} cols={2.2}>
                            {this.state.data.map((tile, i) => (
                                <GridTile
                                    key={i}
                                    title={tile.title}
                                    actionIcon={tile.id === "next"?null : <IconButton onClick={this.additem.bind(this, i)}>{tile.isAdded ? (<PlaylistAddCheck color="rgb(0, 0, 0)" />) : (<PlaylistAdd color="rgb(0, 0, 0)" />)}</IconButton>}
                                    titleStyle={this.state.styles.titleStyle}
                                    titleBackground="linear-gradient(to top, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 70%,rgba(255,255,255,0.6) 100%)"
                                    >
                                    <img style={this.state.styles.imageStyle} 
                                        onClick={this.itemClicked.bind(this, tile.id)} 
                                        src={tile.id == "next" ? tile.poster_path : (
                                                            tile.poster_path === null?"/public/images/movie-icon.png":"https://image.tmdb.org/t/p/w300_and_h450_bestv2/" + tile.poster_path
                                                            )} />
                                </GridTile>
                            ))}
                        </GridList>
                    </div>
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

export default HomePage;