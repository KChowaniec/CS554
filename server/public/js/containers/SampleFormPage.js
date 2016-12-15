import React, { PropTypes } from 'react';
import MovieSearchForm from '../components/MovieSearchForm.js';
import { browserHistory } from 'react-router';
class HomePage extends React.Component {

    /**
     * Class constructor.
     */
    constructor(props) {
        super(props);

        // set the initial component state
        this.state = {
            errors: {},
            search: {
                title: '',
                genre: '',
                rating: '',
                actor: '',
                director: '',
                year: '',
                keywords: ''
            }
        };

        this.processForm = this.processForm.bind(this);
        this.changeSearch = this.changeSearch.bind(this);
        this.saveForm = this.saveForm.bind(this);
    }

    /**
   * Change the user object.
   *
   * @param {object} event - the JavaScript event object
   */
    changeSearch(event) {
        const field = event.target.name;
        const search = this.state.search;
        search[field] = event.target.value;

        this.setState({
            search
        });
    }

    //save user's preferences
    saveForm(event) {

    }
    /**
   * Process the form.
   *
   * @param {object} event - the JavaScript event object
   */
    processForm(event) {
        // prevent default action. in this case, action is the form submission event
        event.preventDefault();
        console.log(this.state.search);
        // create a string for an HTTP body message
        const title = this.state.search.title;
        const genre = this.state.search.genre;
        const rating = this.state.search.rating;
        const actor = this.state.search.actor;
        const director = this.state.search.director;
        const year = this.state.search.year;
        const keywords = this.state.search.keywords;

        var requestConfig = {
            method: "POST",
            url: "/search",
            contentType: 'application/json',
            data: JSON.stringify({
                title: title,
                parseGenre: genre,
                rating: rating,
                parseActors: actor,
                director: director,
                releaseYear: year,
                parseWords: keywords
            })
        };
        let reactThis = this;
        $.ajax(requestConfig).then((responseMessage) => {
            if (responseMessage.success) {
                console.log(responseMessage);
                reactThis.setState({
                    errors: {}
                });
                browserHistory.push("/search/results/1?" + responseMessage.query);
            }
            else {
                console.log("error");
                const errors = responseMessage.errors ? responseMessage.errors : {};
                errors.summary = responseMessage.message;

                reactThis.setState({
                    errors
                });
            }
        });
    }

    // Render the component.
    render() {
        return (
            <MovieSearchForm
                onSubmit={this.processForm}
                onChange={this.changeSearch}
                onSave={this.saveForm}
                errors={this.state.errors}
                search={this.state.search}
                />
        );
    }

}

HomePage.contextTypes = {
    router: PropTypes.object.isRequired
};


export default HomePage;