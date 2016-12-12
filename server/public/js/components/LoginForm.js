import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
// import Save from 'material-ui/svg-icons/save';

const LoginForm = ({
  onSubmit,
  onChange,
  error,
  user
}) => (
    <Card className="container">
      <form action="/" onSubmit={onSubmit}>
        <h2 className="card-heading">Login</h2>

        {error && <p className="error-message">Invalid login credentials</p>}

        <div className="field-line">
          <TextField
            floatingLabelText="Username"
            name="username"
            errorText={error.username}
            onChange={onChange}
            value={user.username}
            />
        </div>

        <div className="field-line">
          <TextField
            floatingLabelText="Password"
            type="password"
            name="password"
            onChange={onChange}
            errorText={error.password}
            value={user.password}
            />
        </div>

        <div className="button-line">
          <RaisedButton type="submit" label="Log in" primary />
        </div>

        <CardText>Don't have an account? <Link to={'/signup'}>Create one</Link>.</CardText>
      </form>
    </Card>
  );

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired
};

export default LoginForm;