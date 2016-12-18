import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { Card, CardTitle, CardHeader } from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import Chip from 'material-ui/Chip';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import axios from 'axios';


var genre = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Foreign", "History", "Horror", "Music",
    "Mystery", "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western"];

function difference(a1, a2) {
    var a2Set = new Set(a2);
    return a1.filter(function(x) { return !a2Set.has(x); });
}

function symmetricDifference(a1, a2) {
    return difference(a1, a2).concat(difference(a2, a1));
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
            keywordSearchResult: [],
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
            },
            error: (xhr, status, err) => {
                console.error(status, err.toString());
            }
        });

    }

    addGenre = (key) => {
        console.log(key);
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
            console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
    };


    deleteGenre = (key) => {
        console.log(key);
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
            console.log(response);
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
        console.log(this.state.personForm)
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
                console.log(this.state.actor);
                this.setState({actor:response.Actor})
                this.setState({crew:response.Crew});
            },
            error: (xhr, status, err) => {
                console.error(status, err.toString());
            }
        });
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
                console.log(response);
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
                            <h3></h3>
                            <div style={this.styles.wrapper}>
                                {this.state.selectedGenre.map(this.renderSelectedGenre,this)}
                            </div>
                            <hr/>
                            <h3>Options:</h3>
                            <div style={this.styles.wrapper}>
                                {this.state.allGenre.map(this.renderOptionsForGenre,this)}
                            </div>
                        </div>
                    </Tab>
                    <Tab label="Person" >
                        {this.state.actor.length}
                        <div className={this.state.actor.length>0?'visible':'hidden'}>
                            <h3>Actors:</h3>
                            <div style={this.styles.wrapper}>
                                {this.state.actor.map(this.renderActor,this)}
                            </div>
                            <hr/>
                        </div>
                        <div className={this.state.crew.length>0?'visible':'hidden'}>
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
                        <div>
                            <h2>Tab Two</h2>
                            <p>
                                This is another example tab.
                            </p>
                        </div>
                    </Tab>
                    <Tab label="Year" >
                        <div>
                            <h2>Tab Two</h2>
                            <p>
                                This is another example tab.
                            </p>
                        </div>
                    </Tab>
                    <Tab label="Age Rating" >
                        <div>
                            <h2>Tab Two</h2>
                            <p>
                                This is another example tab.
                            </p>
                        </div>
                    </Tab>
                </Tabs>
            </Card>
        )
    }
}

export default PreferencePage;
