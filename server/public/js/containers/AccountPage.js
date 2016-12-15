import React, { PropTypes } from 'react';
import Account from '../components/Account.js';
import { browserHistory } from 'react-router';

class AccountPage extends React.Component {

    /**
     * Class constructor.
     */
    constructor(props) {
        super(props);

        // set the initial component state
        this.state = {
            errors: {},
            error: false,
            success: false,
            user: {
                email: '',
                password: '',
                confirm: ''
            }
        };

        this.processForm = this.processForm.bind(this);
        this.changeUser = this.changeUser.bind(this);
    }

    /**
     * Process the form.
     *
     * @param {object} event - the JavaScript event object
     */
    processForm(event) {
        // prevent default action. in this case, action is the form submission event
        event.preventDefault();

        // create a string for an HTTP body message
        const email = this.state.user.email;
        const password = this.state.user.password;
        const confirm = this.state.user.confirm;

        let errors = {};
        if (!email) {
            errors.username = "This field is required";
        }
        if (!password) {
            errors.password = "This field is required";
        }
        if (!confirm) {
            errors.confirm = "This field is required";
        }
        if (confirm && password && (confirm != password)) {
            errors.confirm = "The confirmed password must match the original password";
        }
        if (!jQuery.isEmptyObject(errors)) {
            return this.setState({ errors })
        }
        else {
            //change account information
            var requestConfig = {
                method: "PUT",
                url: "/user",
                contentType: 'application/json',
                data: JSON.stringify({
                    password: password,
                    email: email,
                    confirm: confirm
                })
            };
            $.ajax(requestConfig).then((responseMessage) => {
                if (responseMessage.success) {
                    return this.setState({ success: true, user: responseMessage.user })
                } else {
                    return this.setState({ error: true })
                }
            });
        }
    }

    /**
     * Change the user object.
     *
     * @param {object} event - the JavaScript event object
     */
    changeUser(event) {
        const field = event.target.name;
        const user = this.state.user;
        user[field] = event.target.value;

        this.setState({
            user
        });
    }

    /**
     * Render the component.
     */
    render() {
        return (
            <Account
                onSubmit={this.processForm}
                onChange={this.changeUser}
                error={this.state.error}
                errors={this.state.errors}
                user={this.state.user}
                success={this.state.success}
                />
        );
    }

}

export default AccountPage;