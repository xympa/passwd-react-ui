import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import LockOutlineIcon from '@material-ui/icons/LockOutlined'

import Button from '@material-ui/core/Button';
import { withSnackbar } from 'notistack';
import { withLocalize, Translate } from 'react-localize-redux'
import localization from './localization.json'
import { performLogin } from '../../actions/AuthenticationActions'
import { Avatar } from '@material-ui/core';

const styles = theme => ({
    textField: {
        margin: theme.spacing.unit
    },
    loginButton: {
        marginTop: theme.spacing.unit * 5,
        backgroundColor: theme.palette.primary.main,
        // backgroundColor: theme.palette.secondary.main,
        color: "white",
        marginBottom: 30
    },
    root: {
        alignItems: "center"
    },
    avatar: {
        marginTop: 50,
        height: 96,
        width: 96,
        backgroundColor: theme.palette.secondary.main
        // backgroundColor: theme.palette.primary.main,

    },
})

class LoginModal extends Component {
    static propTypes = {
        addTranslation: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        performLogin: PropTypes.func.isRequired,
        translate: PropTypes.func.isRequired,
        enqueueSnackbar: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            username: props.username || ""
        }

        props.addTranslation(localization)

        this._attemptLogin = this._attemptLogin.bind(this)
    }

    _checkIfShouldSubmit = () => event => {
        if (event.key === "Enter")
            this._attemptLogin();
    }

    _handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    _attemptLogin() {
        const { enqueueSnackbar, performLogin, translate } = this.props;
        const { username, password } = this.state;

        performLogin(username, password)
            .then(() => {
                this.setState({ password: "" })
            })
            .catch(() => {
                enqueueSnackbar(translate("badAuth"))
            })
    }

    render() {

        const { classes, open } = this.props
        const { password, username } = this.state

        return (
            <Dialog maxWidth="xs" fullWidth open={open} classes={{ paper: classes.root }}>
                
                
                    <Avatar color="primary" className={classes.avatar}>
                        <LockOutlineIcon fontSize="large" />
                    </Avatar>
                    <img src={require("../../assets/logo-cor.png")} alt="enso logo" style={{ maxWidth: "70%", marginTop: 25, marginBottom: 25 }} />
                
                <div style={{ flexDirection: "column", display: "flex" }}>
                    <TextField
                        label={<Translate id="username" />}
                        id="username"
                        value={username}
                        onChange={this._handleChange('username')}
                        className={classes.textField}
                        onKeyPress={this._checkIfShouldSubmit()}
                    />
                    <TextField
                        label={<Translate id="password" />}
                        type="password"
                        id="password"
                        value={password}
                        onChange={this._handleChange('password')}
                        className={classes.textField}
                        onKeyPress={this._checkIfShouldSubmit()}
                    />
                    <Button variant="contained" className={classes.loginButton} onClick={this._attemptLogin}>Login</Button>
                </div>
            </Dialog>
        )
    }
}

const mapStateToProps = (state) => ({
    username: state.authentication.username
})

const mapDispatchToProps = {
    performLogin
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(withLocalize(LoginModal))))
