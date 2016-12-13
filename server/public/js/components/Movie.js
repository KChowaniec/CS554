import React from 'react';
import { Card, CardTitle,CardText } from 'material-ui/Card';

const Movie = ({
  onChange,
  error,
  movie
}) => (
  <Card className="container">
    <CardTitle title={movie.title} subtitle={movie.releaseDate} />
    <CardText>{movie.description}</CardText>
  </Card>
);

export default Movie;