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
                console.log(this.state.personSearchResult)
                console.log(response.results)
            },
            error: (xhr, status, err) => {
                console.error(status, err.toString());
            }
        });
    }

    addPerson(data){
        $.ajax({
            url: '/user/add_person',
            dataType: 'json',
            cache: false,
            data: "value="+data.id,
            success: (response) => {
                console.log(response);
            },
            error: (xhr, status, err) => {
                console.error(status, err.toString());
            }
        });
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
                        <div>
                            <hr/>
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
                            <hr/>
                            <div>
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
