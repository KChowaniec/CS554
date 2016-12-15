import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';


const MovieSearchForm = ({
    onSubmit,
    onChange,
    onSave,
    errors,
    search,
}) => (
        <Card className="container">
            <form action="/" onSubmit={onSubmit}>
                <h2 className="card-heading">Search</h2>

                {errors.summary && <p className="error-message">{errors.summary}</p>}
                <p>Search with Title</p>
                <div className="field-line">
                    <TextField
                        floatingLabelText="Movie Title"
                        name="title"
                        errorText={errors.title}
                        onChange={onChange}
                        value={search.title}
                        />
                </div>
                <p>Search with Criteria</p>
                <div className="field-line">
                    <TextField
                        floatingLabelText="Genre"
                        name="genre"
                        errorText={errors.genre}
                        onChange={onChange}
                        value={search.genre}
                        />
                </div>

                <div className="field-line">
                    <TextField
                        floatingLabelText="Age Rating"
                        name="rating"
                        errorText={errors.rating}
                        onChange={onChange}
                        value={search.rating}
                        />
                </div>

                <div className="field-line">
                    <TextField
                        floatingLabelText="Release Year"
                        name="year"
                        onChange={onChange}
                        errorText={errors.year}
                        value={search.year}
                        />
                </div>

                <div className="field-line">
                    <TextField
                        floatingLabelText="Actor (Comma separated)"
                        name="actor"
                        onChange={onChange}
                        errorText={errors.actor}
                        value={search.actor}
                        />
                </div>
                <div className="field-line">
                    <TextField
                        floatingLabelText="Director (Comma separated)"
                        name="director"
                        onChange={onChange}
                        errorText={errors.director}
                        value={search.director}
                        />
                </div>
                <div className="field-line">
                    <TextField
                        floatingLabelText="Keywords"
                        name="keywords"
                        onChange={onChange}
                        errorText={errors.keywords}
                        value={search.keywords}
                        />
                </div>

                <div className="button-line">
                    <RaisedButton type="submit" label="Search" primary />
                </div>

                <CardText>Save preferences?<RaisedButton type="button" label="Save" secondary /></CardText>
            </form>
        </Card>
    );

MovieSearchForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    search: PropTypes.object.isRequired,
};

export default MovieSearchForm;