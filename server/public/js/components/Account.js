import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

const Account = ({
    onSubmit,
    onChange,
    error,
    errors,
    success,
    user
}) => (
        <Card className="container">
            <form action="/" onSubmit={onSubmit}>
                <h2 className="card-heading">Change Account Settings</h2>

                {error && <p className="error-message">{errors.message}</p>}
                {success && <p className="success-message">Account has been updated successfully</p>}
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
                        floatingLabelText="New Password"
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
                    <RaisedButton type="submit" label="Update" primary />
                </div>
            </form>
        </Card>
    );

Account.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.bool.isRequired,
    errors: PropTypes.object.isRequired,
    success: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired
};

export default Account;