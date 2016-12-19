import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { Card, CardTitle, CardHeader } from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import Chip from 'material-ui/Chip';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';


import axios from 'axios';


var genre = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Foreign", "History", "Horror", "Music",
    "Mystery", "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western"];

var ageRating = ["NR", "G", "PG", "PG-13", "R", "NC-17"]

function difference(a1, a2) {
    var a2Set = new Set(a2);
    return a1.filter(function(x) { return !a2Set.has(x); });
}

function symmetricDifference(a1, a2) {
    return difference(a1, a2).concat(difference(a2, a1));
}

function removeByKey(array, params){
    array.some(function(item, index) {
        if(array[index][params.key] === params.value){
            // found it!
            array.splice(index, 1);
            return true; // stops the loop
        }
        return false;
    });
    return array;
}

class PreferencePage extends React.Component {

    constructor(props) {
        super(props);

        // set the initial component state
        this.state = {
            errors: {},
            error: false,
            success: false,
            selectedGenre: [],
            actor: [],
            crew: [],
            allGenre : genre,
            personSearchResult: [],
            keywords: [],
            keywordsSearchResult: [],
            keywordsForm: '',
            selectedAgeRating: [],
            allAgeRating: ageRating,
            year: [],
            yearForm: '',
            errorText:'',
            errorVisibility: false,
        };
        this.styles = {
            chip: {
                margin: 4,
            },
            wrapper: {
                display: 'flex',
                flexWrap: 'wrap',
            },
            personForm: {
                marginLeft: 30,
            },
        };
        this.addGenre = this.addGenre.bind(this);
        this.deleteGenre = this.deleteGenre.bind(this);
    }

    componentDidMount(){

        $.ajax({
            url: '/user/get_preferences',
            dataType: 'json',
            cache: false,
            success: (response) => {
                this.setState({selectedGenre: response.user.Genre});
                this.setState({allGenre:symmetricDifference(response.user.Genre,genre)});
                this.setState({actor:response.user.Actor})
                this.setState({crew:response.user.Crew})
                this.setState({selectedAgeRating:response.user.ageRating})
                this.setState({keywords:response.user.keywords})
                this.setState({year:response.user.releaseYear})
            },
            error: (xhr, status, err) => {
                console.error(status, err.toString());
            }
        });

    }

    addGenre = (key) => {
        var selected = this.state.selectedGenre;
        selected.push(key);
        this.setState({selectedGenre: selected});

        var allGenre = this.state.allGenre;
        var index = allGenre.indexOf(key);
        if (index > -1) {
            allGenre.splice(index, 1);
        }
        this.setState({allGenre: allGenre});

        axios.post('/user/update_genre', {
            genreList: this.state.selectedGenre
        }).then(function (response) {
            // console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
    };

    deleteGenre = (key) => {
        var allGenre = this.state.allGenre;
        allGenre.push(key);
        this.setState({allGenre: allGenre});

        var selected = this.state.selectedGenre;
        var index = selected.indexOf(key);
        if (index > -1) {
            selected.splice(index, 1);
        }
        this.setState({selectedGenre: selected});


        axios.post('/user/update_genre', {
            genreList: this.state.selectedGenre
        }).then(function (response) {
            // console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
    };

    renderOptionsForGenre(data) {
        return (
            <Chip key={data} onTouchTap={() => this.addGenre(data)} style={this.styles.chip}>
                {data}
            </Chip>
        );
    }

    renderSelectedGenre(data){
        return (
            <Chip key={data} onRequestDelete={() => this.deleteGenre(data)} style={this.styles.chip}>
                {data}
            </Chip>
        );
    }

    handlePerson(event) {
        this.setState({personForm: event.target.value});
    }

    searchPerson(e){
        e.preventDefault();
        $.ajax({
            url: '/search/person',
            dataType: 'json',
            method: "GET",
            data: "value="+this.state.personForm,
            cache: false,
            success: (response) => {
               this.setState({personSearchResult:response.results});
            },
            error: (xhr, status, err) => {
                console.error(status, err.toString());
            }
        });
    }

    addPerson(data){
        var id = data.id;
        $.ajax({
            url: '/user/add_person',
            dataType: 'json',
            method: "POST",
            cache: false,
            data: "value="+id,
            success: (response) => {
                this.setState({actor:response.results.Actor});
                this.setState({crew:response.results.Crew});
            },
            error: (xhr, status, err) => {
                console.error(status, err.toString());
            }
        });


        var personSearchResult = this.state.personSearchResult;
        personSearchResult = removeByKey(personSearchResult,{id:data.id,name:data.name})
        this.setState({personSearchResult:personSearchResult});
    }

    deletePerson(data,type){

        let actor = this.state.actor;
        let crew = this.state.crew;
        switch(type)
        {
            case 'actor' : actor = actor.filter(item => item !== data); break;
            case 'crew' : crew = crew.filter(item => item !== data); break;
        }

        this.setState({actor:actor,crew:crew});
        $.ajax({
            url: '/user/update_person',
            dataType: 'json',
            method: "POST",
            cache: false,
            data: {actor:actor,crew:crew},
            success: (response) => {
                // console.log(response);
            },
            error: (xhr, status, err) => {
                console.error(status, err.toString());
            }
        });
        this.forceUpdate();
    }

    renderCrew(data){
        return (
            <Chip key={data} onRequestDelete={() => this.deletePerson(data,'crew')} style={this.styles.chip}>
                {data}
            </Chip>
        );
    }

    renderActor(data){
        return (
            <Chip key={data} onRequestDelete={() => this.deletePerson(data,'actor')} style={this.styles.chip}>
                {data}
            </Chip>
        );
    }

    renderPersonSearchResult(data){
        return (
            <Chip key={data.id} onTouchTap={() => this.addPerson(data)} style={this.styles.chip}>
                {data.name}
            </Chip>
        );
    }

    addAgeRating(key){
        var selectedAgeRating = this.state.selectedAgeRating;
        selectedAgeRating.push(key);
        this.setState({selectedAgeRating: selectedAgeRating});

        var allAgeRating = this.state.allAgeRating;
        var index = allAgeRating.indexOf(key);
        if (index > -1) {
            allAgeRating.splice(index, 1);
        }
        this.setState({allAgeRating: allAgeRating});

        axios.post('/user/update_ageRating', {
            ageRating: this.state.selectedAgeRating
        }).then(function (response) {
            // console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
    }

    deleteAgeRating(key){
        var allAgeRating = this.state.allAgeRating;
        allAgeRating.push(key);
        this.setState({allAgeRating: allAgeRating});

        var selectedAgeRating = this.state.selectedAgeRating;
        var index = selectedAgeRating.indexOf(key);
        if (index > -1) {
            selectedAgeRating.splice(index, 1);
        }
        this.setState({selectedAgeRating: selectedAgeRating});

        axios.post('/user/update_ageRating', {
            ageRating: this.state.selectedAgeRating
        }).then(function (response) {
            // console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
    }

    renderOptionsForAgeRating(data){
        return (
            <Chip key={data} onTouchTap={() => this.addAgeRating(data)} style={this.styles.chip}>
                {data}
            </Chip>
        );
    }

    renderSelectedAgeRating(data){
        return (
            <Chip key={data} onRequestDelete={() => this.deleteAgeRating(data)} style={this.styles.chip}>
                {data}
            </Chip>
        );
    }

    deleteYear(key){
        var allYear = this.state.year;
        var index = allYear.indexOf(key)
        if (index > -1) {
            allYear.splice(index,1);
        }
        this.setState({year:allYear});

        axios.post('/user/update_year', {
            year: this.state.year
        }).then(function (response) {
            // console.log(response);
        }).catch(function (error) {
            console.log(error);
        });

    }

    renderYear(data){
        return (
            <Chip key={data} onRequestDelete={() => this.deleteYear(data)} style={this.styles.chip}>
                {data}
            </Chip>
        );
    }

    handleKeyword(event) {
        this.setState({keywordsForm: event.target.value});
    }

    addKeywords(data){
        var keywords = this.state.keywords;
        if(!keywords.includes(data.name)){
            keywords.push(data.name);
        }
        var keywordsSearchResult = this.state.keywordsSearchResult;
        keywordsSearchResult = removeByKey(keywordsSearchResult,{id:data.id,name:data.name})
        this.setState({keywordsSearchResult:keywordsSearchResult});

        axios.post('/user/update_keywords', {
            keywords: this.state.keywords
        }).then(function (response) {
            // console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
    }

    deleteKeywords(data){
        var keywords = this.state.keywords
        var index = keywords.indexOf(data)
        if(index>-1)
        {
            keywords.splice(index,1)
        }
        this.setState({keywords:keywords})

        axios.post('/user/update_keywords', {
            keywords: this.state.keywords
        }).then(function (response) {
            // console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
    }

    renderKeywords(data){
        return (
            <Chip key={data} onRequestDelete={() => this.deleteKeywords(data)} style={this.styles.chip}>
                {data}
            </Chip>
        );
    }

    renderKeywordsSearchResult(data){
        return (
            <Chip key={data.id} onTouchTap={() => this.addKeywords(data)} style={this.styles.chip}>
                {data.name}
            </Chip>
        );
    }

    keywordSearch(e){
        e.preventDefault();
        $.ajax({
            url: '/search/keywords',
            dataType: 'json',
            method: "GET",
            data: "value="+this.state.keywordsForm,
            cache: false,
            success: (response) => {
                this.setState({keywordsSearchResult:response.results});
            },
            error: (xhr, status, err) => {
                console.error(status, err.toString());
            }
        });
    }

    addYear(event){
        event.preventDefault();

        let allYear = this.state.year
        let year = this.state.yearForm

        if(year.length != 4){
            this.setState({errorVisibility:true});
            this.setState({errorText:'Not a valid year'});
        }else{
            var index = allYear.indexOf(year);
            if (index > -1) {
                this.setState({errorVisibility:true});
                this.setState({errorText:'Year Already Exist'});
            }else{
                allYear.push(year);
                this.setState({yearForm:''});
            }
            this.setState({year:allYear})

            axios.post('/user/update_year', {
                year: this.state.year
            }).then(function (response) {
                // console.log(response);
            }).catch(function (error) {
                console.log(error);
            });
        }


    }

    handleYear(event){
        this.setState({yearForm: event.target.value})
    }


    render(){
        return (
            <Card className="container">
                <CardHeader
                    title="Preferences"
                    subtitle="these will be used as your movie search defaults"
                />
                <Tabs>
                    <Tab label="Genre" >
                        <div>
                            <div className={this.state.selectedGenre.length?'visible':'hidden'} style={this.styles.wrapper}>
                                {this.state.selectedGenre.map(this.renderSelectedGenre,this)}
                                <hr/>
                            </div>
                            <h3>Options:</h3>
                            <div style={this.styles.wrapper}>
                                {this.state.allGenre.map(this.renderOptionsForGenre,this)}
                            </div>
                        </div>
                    </Tab>
                    <Tab label="Person" >
                        <div className={this.state.actor.length?'visible':'hidden'}>
                            <h3>Actors:</h3>
                            <div style={this.styles.wrapper}>
                                {this.state.actor.map(this.renderActor,this)}
                            </div>
                            <hr/>
                        </div>
                        <div className={this.state.crew.length?'visible':'hidden'}>
                            <h3>Crew</h3>
                            <div style={this.styles.wrapper}>
                                {this.state.crew.map(this.renderCrew,this)}
                            </div>
                            <hr/>
                        </div>
                        <div>
                            <form className="preference-person" onSubmit={this.searchPerson.bind(this)}>
                                <TextField
                                    hintText="Jim Parson"
                                    name="person"
                                    floatingLabelText="Search for person"
                                    onChange={this.handlePerson.bind(this)}
                                    required
                                />
                                <RaisedButton type="submit" label="Search" primary={true}  style={this.styles.personForm} />
                            </form>
                            <div className={this.state.personSearchResult.length>0?'visible':'hidden'}>
                                <hr/>
                                <h3>Options:</h3>
                                <div style={this.styles.wrapper}>
                                    {this.state.personSearchResult.map(this.renderPersonSearchResult,this)}
                                </div>
                            </div>
                        </div>
                    </Tab>
                    <Tab label="Keywords" >
                        <div className={this.state.keywords.length?'visible':'hidden'}>
                            <h3>Keywords</h3>
                            <div style={this.styles.wrapper}>
                                {this.state.keywords.map(this.renderKeywords,this)}
                            </div>
                            <hr/>
                        </div>
                        <div>
                            <form className="preference-keyword" onSubmit={this.keywordSearch.bind(this)}>
                                <TextField
                                    hintText="Keyword"
                                    name="keyword"
                                    floatingLabelText="Search for Keyword"
                                    onChange={this.handleKeyword.bind(this)}
                                    value={this.state.keywordsForm}
                                    required
                                />
                                <RaisedButton type="submit" label="Search" primary={true}  style={this.styles.personForm} />
                            </form>
                            <div className={this.state.keywordsSearchResult.length>0?'visible':'hidden'}>
                                <hr/>
                                <h3>Options:</h3>
                                <div style={this.styles.wrapper}>
                                    {this.state.keywordsSearchResult.map(this.renderKeywordsSearchResult,this)}
                                </div>
                            </div>
                        </div>
                    </Tab>
                    <Tab label="Year" >
                        <div className={this.state.year.length?'visible':'hidden'}>
                            <div style={this.styles.wrapper}>
                                {this.state.year.map(this.renderYear,this)}
                            </div>
                            <hr/>
                        </div>
                        <div>
                            <form className="preference-year" onSubmit={this.addYear.bind(this)}>
                                <TextField
                                    hintText="2016"
                                    name="year"
                                    floatingLabelText="Release Year"
                                    onChange={this.handleYear.bind(this)}
                                    value={this.state.yearForm}
                                    required
                                />
                                <RaisedButton type="submit" label="Add" primary={true}  style={this.styles.personForm} />
                            </form>
                        </div>
                    </Tab>
                    <Tab label="Age Rating" >
                        <div>
                            <div className={this.state.selectedAgeRating.length?'visible':'hidden'} style={this.styles.wrapper}>
                                {this.state.selectedAgeRating.map(this.renderSelectedAgeRating,this)}
                                <hr/>
                            </div>
                            <div className={this.state.allAgeRating.length?'visible':'hidden'}>
                                <h3>Options:</h3>
                                <div style={this.styles.wrapper} >
                                    {this.state.allAgeRating.map(this.renderOptionsForAgeRating,this)}
                                </div>
                            </div>
                        </div>
                    </Tab>
                </Tabs>
                <Snackbar
                    open={this.state.errorVisibility}
                    message={this.state.errorText}
                    autoHideDuration={4000}
                />
            </Card>
        )
    }
}

export default PreferencePage;
