/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Switch, Route, Redirect } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import LoginPage from '../LoginPage'
import { checkAuthValidity } from '../../actions/AuthenticationActions'
import Header from '../Header'
import CredentialModal from '../CredentialModal'
import FolderPage from '../FolderPage'

const styles = () => ({
    root: {
        backgroundImage: `url(${require('../../assets/pattern_bg.png')})`,
        minHeight: "calc(100vh - 64px)"
    }
});

export class MainSwitch extends Component {
    static propTypes = {
        isLoggedIn: PropTypes.bool,
        username: PropTypes.string,
        sessionKey: PropTypes.string,
        checkAuthValidity: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired
    }

    componentDidMount() {

        const { checkAuthValidity, sessionKey, username } = this.props;

        checkAuthValidity(username, sessionKey);
    }

    render() {

        const {classes, isLoggedIn} = this.props;

        if (!isLoggedIn)
            return (
                <Route path="/" component={LoginPage} />
            );
        else
            return (
                <div>
                    <Header />
                    <div className={classes.root}>
                        <Switch>
                            <Redirect exact path="/" to="/home" />
                            <Route path="/home" component={FolderPage} />
                        </Switch>
                        <CredentialModal />
                    </div>
                </div>);
    }
}

const mapStateToProps = (state) => {

    return ({
        isLoggedIn: state.authentication.validity,
        username: state.authentication.username,
        sessionKey: state.authentication.sessionKey
    })
}

const mapDispatchToProps = {
    checkAuthValidity
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MainSwitch))
