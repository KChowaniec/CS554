import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';


const SignUpForm = ({
  onSubmit,
  onChange,
  errors,
  user,
}) => (
    <Card className="container">
      <form action="/" onSubmit={onSubmit}>
        <h2 className="card-heading">Sign Up</h2>

        {errors && <p className="error-message">Please correct the errors</p>}
        <div className="field-line">
          <TextField
            floatingLabelText="Username"
            name="username"
            errorText={errors.username}
            onChange={onChange}
            value={user.username}
            />
        </div>

        <div className="field-line">
          <TextField
            floatingLabelText="Name"
            name="name"
            errorText={errors.name}
            onChange={onChange}
            value={user.name}
            />
        </div>

        <div className="field-line">
          <TextField
            floatingLabelText="Email"
            name="email"
            errorText={errors.email}
            onChange={onChange}
            value={user.email}
            />
        </div>

        <div className="field-line">
          <TextField
            floatingLabelText="Password"
            type="password"
            name="password"
            onChange={onChange}
            errorText={errors.password}
            value={user.password}
            />
        </div>

        <div className="field-line">
          <TextField
            floatingLabelText="Confirm Password"
            type="password"
            name="confirm"
            onChange={onChange}
            errorText={errors.confirm}
            value={user.confirm}
            />
        </div>

        <div className="button-line">
          <RaisedButton type="submit" label="Create New Account" primary />
        </div>

        <CardText>Already have an account? <Link to={'/'}>Log in</Link></CardText>
      </form>
    </Card>
  );

SignUpForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

export default SignUpForm;