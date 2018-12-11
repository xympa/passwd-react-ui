import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { Grid, FormControl, InputLabel, FilledInput, Button } from '@material-ui/core';
import { withSnackbar } from 'notistack';
import { performLogin } from '../../actions/AuthenticationActions'


const styles = theme => ({
    root: {
        backgroundImage: `url(${require('./assets/bgr.jpg')})`,
        minHeight: "100vh"
    },
    ensoTopLogo: {
        height: theme.spacing.unit * 20,
        backgroundColor: theme.palette.primary.main,
        borderRadius: "0 0 10px 10px",
    },
    passwdLogo: {
        maxWidth: theme.spacing.unit * 40,
        marginTop: theme.spacing.unit * 5
    },
    fitParent: {
        maxHeight: "100%",
        maxWidth: "100%"
    },
    textField: {
        backgroundColor: "white !important",
    },
    formControl: {
        margin: theme.spacing.unit
    },
    formContainer: {
        marginTop: theme.spacing.unit * 5
    },
    loginButton: {
        marginTop: theme.spacing.unit * 5,
        backgroundColor: theme.palette.primary.main,
        color: "white",
        justifySelf: "center",
        flex: 1
    }
});

export class LoginPage extends Component {
    static propTypes = {
        username: PropTypes.string,
        enqueueSnackbar: PropTypes.func.isRequired,
        history: PropTypes.object,
        performLogin: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            username: props.username || ""
        }

        this._attemptLogin = this._attemptLogin.bind(this)
    }

    _handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    _checkIfShouldSubmit = () => event => {
        if (event.key === "Enter")
            this._attemptLogin();
    }

    _attemptLogin() {
        const { enqueueSnackbar, performLogin } = this.props;
        const { username, password } = this.state;

        performLogin(username, password)
            .then(() => {
                const { history } = this.props;
                history.replace('/home');
            })
            .catch(() => {
                enqueueSnackbar("Wrong Credentials")
            })
    }

    render() {
        const { classes } = this.props;
        const { username, password } = this.state;

        return (
            <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="center"
                className={classes.root}
            >
                <Grid item className={classes.ensoTopLogo}>
                    <img src={require("../../assets/enso_logo_branco.png")} alt="enso logo" className={classes.fitParent} />
                </Grid>
                <Grid item>
                    <img src={require("../../assets/logo-cor.png")} alt="enso logo" className={classes.passwdLogo} />
                </Grid>
                <Grid item>
                    <form className={classes.formContainer} noValidate autoComplete="off">
                        <Grid
                            container
                            direction="column"
                            justify="flex-start"
                            alignItems="center"
                        >
                            <Grid item>
                                <FormControl variant="filled" className={classes.formControl}>
                                    <InputLabel htmlFor="username">Username</InputLabel>
                                    <FilledInput
                                        fullWidth
                                        id="username"
                                        value={username}
                                        onChange={this._handleChange('username')}
                                        className={classes.textField}
                                        onKeyPress={this._checkIfShouldSubmit()}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl variant="filled" className={classes.formControl}>
                                    <InputLabel htmlFor="password">Password</InputLabel>
                                    <FilledInput
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={this._handleChange('password')}
                                        className={classes.textField}
                                        onKeyPress={this._checkIfShouldSubmit()}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item style={{ display: "flex" }}>
                                <Button variant="contained" className={classes.loginButton} onClick={this._attemptLogin}>Login</Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => ({
    username: state.authentication.username
})

const mapDispatchToProps = {
    performLogin
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(LoginPage)))
