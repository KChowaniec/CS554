import React, { PropTypes } from 'react';
import Account from '../components/Account.js';
import { browserHistory } from 'react-router';
import axios from 'axios';
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

    componentDidMount() {
        //prepopulate user info 
        axios.get('/user')
            .then(res => {
                var userInfo = {};
                var data = JSON.parse(res.data.user);
                userInfo.email = data.profile.email;
                userInfo.password = '';
                userInfo.confirm = '';
                return this.setState({ user: userInfo });
            });
    }

    /**
     * Process the form.
     *
     * @param {object} event - the JavaScript event object
     */
    processForm(event) {
        // prevent default action. in this case, action is the form submission event
        event.preventDefault();

        const email = this.state.user.email;
        const password = this.state.user.password;
        const confirm = this.state.user.confirm;

        var errors = {};
        if (confirm && !password) {
            errors.password = "This field is required";
        }
        if (password && !confirm) {
            errors.confirm = "This field is required";
        }
        if (confirm && password && (confirm != password)) {
            errors.confirm = "The confirmed password must match the entered password";
        }
        if (!jQuery.isEmptyObject(errors)) {
            errors.message = "Please correct the errors";
            return this.setState({ errors })
        }

        else {
            //change account information
            var requestConfig = {
                method: "PUT",
                url: "/user",
                contentType: 'application/json',
                data: JSON.stringify({
                    email: email,
                    password: password
                })
            };
            var reactThis = this;
            $.ajax(requestConfig).then((responseMessage) => {
                if (responseMessage.success) {
                    if (responseMessage.user.profile.email) {
                        var newInfo = {};
                        newInfo.email = responseMessage.user.profile.email;
                        newInfo.password = '';
                        newInfo.confirm = '';
                        return reactThis.setState({ success: true, user: newInfo })
                    }
                    else {
                        return reactThis.setState({ success: true })
                    }
                } else {
                    var errors = {};
                    errors.message = "An error occurred";
                    return reactThis.setState({ error: true, errors: errors })
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