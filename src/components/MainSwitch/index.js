/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Switch, Route, withRouter, matchPath, Redirect } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { CssBaseline, Drawer, } from '@material-ui/core'
import { withLocalize } from "react-localize-redux"
import { renderToStaticMarkup } from "react-dom/server"
import globalTranslations from './globalTranslations.json'
import { requestFolderContents } from '../../actions/FolderActions';
import { checkAuthValidity } from '../../actions/AuthenticationActions'
import Header from '../Header'
import FolderPage from '../FolderPage'
import DrawerContent from './DrawerContent';
import InboxView from '../InboxView'
import OutboxView from '../OutboxView'
import MessageModal from '../MessageModal/MessageModal'
import FolderAdminView from '../FolderAdminView';
import LogsPage from '../LogsPage';
import UserPage from '../UserPage';
import LoginModal from '../LoginModal'

export const drawerWidth = 300;

const styles = theme => ({
    root: {
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end"
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
        },
    },
    menuButton: {
        marginRight: 20,
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
        height: `calc(100vh - 64px)`,
        transform: "translateY(64px) !important",
        overflowX: "hidden",
    },
    drawerRoot: {
        top: 64,
        position: 'absolute'
    },
    backDropRoot: {
        height: `calc(100vh - 64px)`,
        top: 64,
        zIndex: 1
    }
});

export class MainSwitch extends Component {
    static propTypes = {
        isLoggedIn: PropTypes.bool,
        username: PropTypes.string,
        sessionKey: PropTypes.string,
        checkAuthValidity: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        initialize: PropTypes.func.isRequired,
        setActiveLanguage: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            width: window.innerWidth,
            mobileOpen: false,
        }

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this.toggleMobileDrawer = this.toggleMobileDrawer.bind(this)

        props.initialize({
            languages: [
                { name: "English", code: "en" },
                { name: "Portuguese", code: "pt" }
            ],
            translation: globalTranslations,
            options: { renderToStaticMarkup }
        });

        props.setActiveLanguage(localStorage.getItem("language") || navigator.language.substring(0, 2))
    }

    componentDidMount() {

        const { checkAuthValidity, sessionKey, username, requestFolderContents, history } = this.props;
        checkAuthValidity(username, sessionKey)
            .then(isLoggedIn => {
                const match = matchPath(history.location.pathname, { path: "/home/:id?", exact: true })
                if ((!match || match && match.params.id) && isLoggedIn) //If mounted on a specific folder, request root to populate drawer
                    requestFolderContents();
            })

        window.addEventListener('resize', this.updateWindowDimensions);
        this.updateWindowDimensions();
    }

    componentDidUpdate(prevProps, prevState) {
        const { requestFolderContents, history, isLoggedIn } = this.props;

        const match = matchPath(history.location.pathname, { path: "/home/:id?", exact: true })
        if ((!match || match && match.params.id) && isLoggedIn && (prevProps.isLoggedIn !== isLoggedIn)) //If mounted on a specific folder, request root to populate drawer
            requestFolderContents();
    }


    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth });
    }

    toggleMobileDrawer() {
        this.setState(prevState => ({ mobileOpen: !prevState.mobileOpen }))
    }

    render() {
        const { classes, isLoggedIn, history, theme } = this.props;
        const { width, mobileOpen } = this.state;

        // if (!isLoggedIn)
        //     return <LoginPage />
        // else {
        //     if (matchPath(history.location.pathname, { path: '/', exact: true }) || matchPath(history.location.pathname, { path: '/login', exact: true }))
        //         history.replace("/home");
        // }

        const isPermanent = width > 992;

        return (
            <div>
                <div className={classes.root} style={!isLoggedIn && {filter: "blur(6px)", transition: "filter ease 200ms"} || {transition: "filter ease 200ms"}}>
                    <CssBaseline />
                    <Header onMenuClick={this.toggleMobileDrawer} />
                    <nav className={classes.drawer}>
                        <Drawer
                            variant={isPermanent ? "permanent" : "temporary"}
                            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                            open={mobileOpen}
                            onBackdropClick={() => { this.setState({ mobileOpen: false }) }}
                            BackdropProps={{
                                classes: {
                                    root: classes.backDropRoot
                                }
                            }}
                            onClose={this.handleDrawerToggle}
                            classes={{
                                root: classes.drawerRoot,
                                paper: classes.drawerPaper,
                            }}
                        >
                            <DrawerContent />
                        </Drawer>
                    </nav>
                    <main style={{ width: `calc(100vw - ${isPermanent ? drawerWidth : 0}px)` }}>
                        <Switch>
                            <Route path="/home/:id?" render={props => (<FolderPage {...props} />)} />
                            <Route path="/inbox" render={() => (<InboxView />)} />
                            <Route path="/outbox" render={() => (<OutboxView />)} />
                            <Route path="/folder-administration" render={() => (<FolderAdminView />)} />
                            <Route path="/logs" render={() => (<LogsPage />)} />
                            <Route path="/user-administration" render={() => (<UserPage />)} />
                            <Redirect from="/" to="/home" />
                        </Switch>
                        <MessageModal />
                    </main>
                </div>
                <LoginModal open={!isLoggedIn} />
            </div>
        );
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
    checkAuthValidity,
    requestFolderContents
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withLocalize(MainSwitch))))