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
import Snackbar from 'material-ui/Snackbar';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const genres = [
    {
        textKey: 'None',
        valueKey: -1
    },
    {
        textKey: 'Action',
        valueKey: 28
    },
    {
        textKey: 'Adventure',
        valueKey: 12
    },
    {
        textKey: 'Animation',
        valueKey: 16
    },
    {
        textKey: 'Comedy',
        valueKey: 35
    },
    {
        textKey: 'Crime',
        valueKey: 80
    },
    {
        textKey: 'Documentary',
        valueKey: 99
    },
    {
        textKey: 'Drama',
        valueKey: 18
    },
    {
        textKey: 'Family',
        valueKey: 10751
    },
    {
        textKey: 'Fantasy',
        valueKey: 14
    },
    {
        textKey: 'Foreign',
        valueKey: 10769
    },
    {
        textKey: 'History',
        valueKey: 36
    },
    {
        textKey: 'Horror',
        valueKey: 27
    },
    {
        textKey: 'Music',
        valueKey: 10402
    },
    {
        textKey: 'Mystery',
        valueKey: 9648
    },
    {
        textKey: 'Romance',
        valueKey: 10749
    },
    {
        textKey: 'Science Fiction',
        valueKey: 878
    },
    {
        textKey: 'TV Movie',
        valueKey: 10770
    },
    {
        textKey: 'Thriller',
        valueKey: 53
    },
    {
        textKey: 'War',
        valueKey: 10752
    },
    {
        textKey: 'Western',
        valueKey: 37
    }
];

const dataSourceConfig = {
    text: 'textKey',
    value: 'valueKey',
};

const style = {
    margin: 12,
};


class SearchBar extends React.Component {

    constructor(props) {
        super(props);

        // set the initial component state
        this.state = {
            GenreSelected: false,
            errors: {},
            data: [],
            errorText: '',
            errorVisibility: false,
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
                director: '',
                genre: '',
                genreText: ''
            },
            currentPage: 1,
            snackbar_open: false,
            customWidth: {
                width: 150,
            },
            searchMessage: 'Search Results will be shown here'
        };

        this.handleMovieNameChange = this.handleMovieNameChange.bind(this);
        this.handleActorChange = this.handleActorChange.bind(this);
        this.handleCrewChange = this.handleCrewChange.bind(this);
        this.handleGenreChange = this.handleGenreChange.bind(this);
        this.handleKeywordChange = this.handleKeywordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleYearChange = this.handleYearChange.bind(this);
        this.handleClear = this.handleClear.bind(this);
    }


    itemClicked(id) {
        if (id !== "next") {
            browserHistory.push('/movie/' + id);
        } else {
            this.getQueryStr_Movies(true);
        }
    }

    additem(index) {
        if (!this.state.data[index].isAdded) {
            var react_component = this;
            var movie_index = index;

            axios.get('/playlist/addmovie/' + this.state.data[index].id)
                .then(res => {
                    if (res.data.success === true) {
                        var arr_search = react_component.state.data;
                        arr_search[movie_index].isAdded = true;
                        react_component.setState({
                            data: arr_search,
                        });
                        this.setState({ errorVisibility: true });
                        this.setState({ errorText: 'Movie added to your playlist!' });
                    } else {
                        this.setState({ errorVisibility: true });
                        this.setState({ errorText: 'There was some problem in adding movie to the playlist.' });
                    }
                });
        } else {
            this.setState({ errorVisibility: true });
            this.setState({ errorText: 'Movie Already Added!' });
        }
    }

    handleClear(event) {
        this.setState({
            parameters: {
                movie: '',
                actor: '',
                director: '',
                genre: '',
                genreText: ''
            },
        })
    }
    handleYearChange(event) {
        this.setState({
            currentPage: 1
        });
        const field = 'years';
        const parameters = this.state.parameters;
        parameters[field] = event.target.value;

        this.setState({ parameters });
    }
    handleMovieNameChange(event) {
        this.setState({
            currentPage: 1
        });
        const field = 'movie';
        const parameters = this.state.parameters;
        parameters[field] = event.target.value;

        this.setState({ parameters });
    }

    handleActorChange(event) {
        this.setState({
            currentPage: 1
        });
        const field = 'actor';
        const parameters = this.state.parameters;
        parameters[field] = event.target.value;

        this.setState({ parameters });
    }

    handleCrewChange(event) {
        this.setState({
            currentPage: 1
        });
        const field = 'crew';
        const parameters = this.state.parameters;
        parameters[field] = event.target.value;

        this.setState({ parameters });
    }

    handleKeywordChange(event) {
        this.setState({
            currentPage: 1
        });
        const field = 'keywords';
        const parameters = this.state.parameters;
        parameters[field] = event.target.value;
        this.setState({ parameters });
    }

    handleGenreChange(value) {
        this.state.GenreSelected = true;
        this.setState({
            currentPage: 1
        });
        const field = 'genre';
        const parameters = this.state.parameters;
        var result = genres.filter(function (key) { return (key.textKey === value) });

        if (result[0]) {
            let genreId = result[0].valueKey;
            parameters[field] = genreId;
        // }
        // else {
        //     parameters[field] = '';
        }
        parameters['genreText'] = value;

        this.setState({ parameters });
    }

    handleUpdateInput(value) {
        //map text value to id
        var result = genres.filter(function (key) { return (key.textKey === value) });
        let genreId = result[0].valueKey;
    };


    applyfilter(playlist, searchResult) {

        var ids = [];
        var filter_indexes = [];

        var index = 0;
        var isFound = false;

        searchResult.forEach(function (element) {
        }, this);

        var counter = 0;
        searchResult.forEach(function (search_item) {
            playlist.forEach(function (pl_item) {
                if (search_item.id == pl_item._id)
                    filter_indexes.push(counter);
            }, this);
            counter++;
        }, this);

        filter_indexes.forEach(function (index) {
            searchResult[index].isAdded = true;
        }, this);

        searchResult.forEach(function (element) {
        }, this);
        return searchResult;
    }


    getQueryStr_Movies(isNextOperation) {
        var myplayList = [];
        var get_playlist = {
            url: "/playlist",
            method: "GET",
            contentType: "application/json; charset=utf-8"
        };

        $.ajax(get_playlist).then(function (res) {
            myplayList = res;
        }, function (err) {
        });

        let title = this.state.parameters.movie;

        let actors = this.state.parameters.actor;
        var genres = !isNaN(this.state.parameters.genre) && this.state.parameters.genre != -1 ? [this.state.parameters.genre] : [];
        //alert(genres);
        var crew = this.state.parameters.crew;

        var keywords = this.state.parameters.keywords;
        var year = this.state.parameters.years;
        var date = new Date();

        try {
            if (year) {
                if (year.indexOf(',') > -1) {
                    year = year.split(',')[0];
                }
                else {
                    if (isNaN(year)) {
                        this.setState({ errorVisibility: true });
                        this.setState({ errorText: 'Please enter a 4 digit number less than 1950' });
                        return;
                    } else if (parseInt(year) < 1950 && parseInt(year) > date.getFullYear()) {
                        this.setState({ errorVisibility: true });
                        this.setState({ errorText: 'Please enter a valid year between 1950 to ' + date.getFullYear() });
                        return;
                    }
                }
            }


        } catch (e) {
            this.setState({ errorVisibility: true });
            this.setState({ errorText: 'Please enter a 4 digit number less than 1950' });
            return;
        }

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
                parseCrew: parseCrew,
                year: year
            })
        };
        var react_com = this;
        $.ajax(getQueryStr).then(function (response) {
            if (response.success) {
                var page_index = isNextOperation ? react_com.state.currentPage + 1 : react_com.state.currentPage;
                react_com.setState({ currentPage: page_index });
                var qry_str = "/search/results/" + page_index + "?" + response.query;
                var getSearch_result = {
                    url: qry_str,
                    method: "GET",
                    contentType: "application/json"
                };
                $.ajax(getSearch_result).then(function (res) {
                    var newArr = res.movies ? res.movies : [];
                    newArr = react_com.applyfilter(myplayList, newArr);
                    var page = parseInt(res.page);
                    var totalPages = parseInt(res.total);
                    if ((totalPages - page) > 0) {
                        if (newArr && newArr.length > 0)
                            newArr.push({
                                id: "next",
                                poster_path: "/public/images/next.png",
                                title: "Load More"
                            });
                    }
                    if (isNextOperation) {

                        var exsisting_movies = react_com.state.data;
                        var final_movie_list = [];
                        exsisting_movies.forEach(function (exsisting_item) {
                            if (exsisting_item.id != 'next')
                                final_movie_list.push(exsisting_item);
                        }, this);
                        newArr.forEach(function (new_item) {
                            final_movie_list.push(new_item);
                        }, this);
                        newArr = final_movie_list;
                    }
                    react_com.setState({
                        data: newArr
                    });
                    if (newArr && newArr.length == 0) {
                        react_com.setState({
                            searchMessage: 'No movie for such criteria'
                        });
                    }
                }, function (err2) {
                    react_com.setState({
                        searchMessage: 'No movie for such criteria'
                    });
                });
            } else {
                react_com.setState({
                    searchMessage: 'No movie for such criteria'
                });
            }

        }, function (err) {
            react_com.setState({
                searchMessage: 'No movie for such criteria'
            });
        });
    }

    handleSubmit(event) {

        event.preventDefault();
        this.getQueryStr_Movies(false);
    }



    componentWillReceiveProps(nextProps) {
        this.setState({ mounted: false });
    }

    mergeArray(array) {
        var result = '';
        for (var i = 0; i < array.length; i++) {
            result += array[i] + ',';
        }
        result = result.charAt(result.length - 1) == ',' ? result.substr(0, result.length - 1) : result;
        return result;
    }

    componentDidMount() {
        this.setState({ mounted: true });
        var getuser_pref = {
            url: "/user",
            method: "GET",
            contentType: "application/json; charset=utf-8"
        };
        var react_component = this;
        $.ajax(getuser_pref).then(function (res) {
            if (res.user && res.user.preferences) {
                var pref = res.user.preferences;
                var _movies = pref.Title ? react_component.mergeArray(pref.Title) : '';
                var _actors = pref.Actor ? react_component.mergeArray(pref.Actor) : '';

                var _crew = pref.Crew ? react_component.mergeArray(pref.Crew) : '';

                var _years = pref.releaseYear ? react_component.mergeArray(pref.releaseYear) : '';
                var _ageratings = pref.ageRating ? react_component.mergeArray(pref.ageRating) : '';

                var _keywords = pref.keywords ? react_component.mergeArray(pref.keywords) : '';

                var xgenre = (pref.Genre && pref.Genre.length > 0 && genres.filter(x => { return x.textKey == pref.Genre[0] }).length > 0) ? genres.filter(x => { return x.textKey == pref.Genre[0] })[0].valueKey : -1;
                var genreText = (pref.Genre && pref.Genre.length > 0 && genres.filter(x => { return x.textKey == pref.Genre[0] }).length > 0) ? genres.filter(x => { return x.textKey == pref.Genre[0] })[0].textKey : '';

                var user_params = {
                    movie: _movies,
                    actor: _actors,
                    genre: xgenre,
                    genreText: genreText,
                    keywords: _keywords,
                    ageRating: _ageratings,
                    years: _years,
                    crew: _crew
                };

                react_component.setState({
                    parameters: user_params
                })
            }
        }, function (err) {
        })

    }

    render() {
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
                                onChange={this.handleActorChange} />
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
                        <div>
                            <TextField
                                type="text"
                                name="keywords"
                                floatingLabelText="Release Year"
                                value={this.state.parameters.years}
                                onChange={this.handleYearChange} />
                        </div>
                        <div className="field-line">
                            <AutoComplete
                                floatingLabelText="Genre"
                                filter={AutoComplete.fuzzyFilter}
                                openOnFocus={true}
                                dataSource={genres}
                                onUpdateInput={this.handleGenreChange}
                                dataSourceConfig={dataSourceConfig}
                                searchText={this.state.parameters.genreText}
                                />
                        </div>

                        <div className="button-line">
                            <RaisedButton type="submit" label="Search" primary style={style} />
                            <RaisedButton onClick={this.handleClear.bind(this)} label="Clear" primary style={style} />
                        </div>

                    </form>
                </Card>
                <div>
                    <br /><br />
                    {this.state.data.length > 0 ? (
                        <Card className="container">
                            <CardTitle title="Search Results" />
                            <br />
                            <div style={this.state.styles.root}>
                                <GridList className="container" style={this.state.styles.gridList} cols={2.2}>
                                    {this.state.data.map((tile, i) => (
                                        <GridTile
                                            key={i}
                                            title={tile.title}
                                            actionIcon={tile.id === "next" ? null : <IconButton onClick={this.additem.bind(this, i)}>{tile.isAdded ? (<PlaylistAddCheck color="rgb(0, 0, 0)" />) : (<PlaylistAdd color="rgb(0, 0, 0)" />)}</IconButton>}
                                            titleStyle={this.state.styles.titleStyle}
                                            titleBackground="linear-gradient(to top, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 70%,rgba(255,255,255,0.6) 100%)"
                                            >
                                            <img className="grid-img" style={this.state.styles.imageStyle}
                                                onClick={this.itemClicked.bind(this, tile.id)}
                                                src={tile.id == "next" ? tile.poster_path : (
                                                    tile.poster_path === null ? "/public/images/movie-icon.png" : "https://image.tmdb.org/t/p/w300_and_h450_bestv2/" + tile.poster_path
                                                )} />
                                        </GridTile>
                                    ))}
                                </GridList>
                                <br /><br />
                            </div>
                        </Card>
                    ) :
                        (
                            <Card className="container">
                                <CardTitle title={this.state.searchMessage} />
                            </Card>
                        )
                    }

                </div>
                <Snackbar
                    open={this.state.errorVisibility}
                    message={this.state.errorText}
                    autoHideDuration={4000}
                    />
            </div>
        );
    }
}


const HomePage = withRouter(React.createClass({
    api: "e443ee14fb107feee75db8b448e6a13e",
    getInitialState: function () {
        return { data: [], mounted: false };
    },

    componentWillReceiveProps: function (nextProps) {

        this.setState({ mounted: false });
    },
    componentDidMount: function () {

        this.setState({ mounted: true });
    },


    render: function () {
        return (<div>
            <SearchBar />
        </div>);
    }
}

));

export default HomePage;
