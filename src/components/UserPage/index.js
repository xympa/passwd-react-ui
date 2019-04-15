import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { Scrollbars } from 'react-custom-scrollbars'
import { Fade, Typography, Zoom, Fab, Divider, Tooltip, CircularProgress } from '@material-ui/core'
import { List } from 'react-virtualized';
import CreateIcon from '@material-ui/icons/Create'
import { withLocalize, Translate } from 'react-localize-redux'
import { requestUserList } from '../../actions/UserActions'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import { measureElement } from '../../Utils'
import UserListItem from '../UserListItem'
import UserAdminModal from '../UserAdminModal'
import localization from './localization.json'

const INITIAL_STATE = {
    isFetching: true,
    error: undefined,
    isCreationModalShowing: false,
    userList: []
}

const styles = theme => ({
    fab: {
        position: 'absolute',
        bottom: theme.spacing.unit * 4,
        right: theme.spacing.unit * 4,
    },
    header: {
        display: "flex",
        height: 64,
        paddingLeft: 64,
        paddingRight: 64,
        justifyContent: "center",
        alignItems: "center"
    }
});

export class UserPage extends Component {
    static propTypes = {
        removeSearchAction: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        addTranslation: PropTypes.func.isRequired,
        translate: PropTypes.func.isRequired,
        requestUserList: PropTypes.func.isRequired,
        isLoggedIn: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            ...INITIAL_STATE,
            width: window.innerWidth,
            height: window.innerHeight,
        }

        this.reloadViewContents = this.reloadViewContents.bind(this)
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)

        const { addTranslation } = this.props
        addTranslation(localization)
    }

    componentDidMount() {
        const { replaceSearchAction, isLoggedIn } = this.props
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        replaceSearchAction(this.reloadViewContents)

        if (isLoggedIn)
            this.reloadViewContents()
    }

    componentDidUpdate(prevProps) {
        const { isLoggedIn } = this.props;
        if (isLoggedIn && prevProps.isLoggedIn !== isLoggedIn)
            this.reloadViewContents()
    }

    componentWillUnmount() {
        const { removeSearchAction } = this.props;
        removeSearchAction();
        window.removeEventListener('resize', this.updateWindowDimensions);
    }


    handleScroll = ({ target }) => {
        const { scrollTop } = target;
        this._list.scrollToPosition(scrollTop);
    }

    updateWindowDimensions() {
        this.setState({ width: measureElement(this).width, height: window.innerHeight });
    }

    reloadViewContents(resolve) {
        const { requestUserList } = this.props;

        this.setState({ isFetching: true }, () => {
            requestUserList(true)
                .then(userList => {
                    this.setState({
                        isFetching: false,
                        userList
                    })
                })
                .catch(error => {
                    this.setState({
                        error: error,
                        isFetching: false
                    });
                })
                .then(() => {
                    this.setState({
                        isFetching: false
                    })
                })
                .then(resolve)
        })
    }

    render() {

        const { isFetching, error, width, height, isCreationModalShowing, userList } = this.state;

        const { classes, translate } = this.props;

        const isSm = window.innerWidth <= 600

        return (
            <div>
                <div className={classes.header}>
                    <Typography variant="h4">
                        <Translate id="userManagement" />
                    </Typography>
                </div>
                <Divider />
                <div style={{ flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <Fade in={isFetching}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: height - 136, position: "absolute", width: width }}>
                            <CircularProgress />
                        </div>
                    </Fade>
                    <Fade in={!isFetching}>
                        <Scrollbars style={{ width, height: height - 138 }} onScroll={this.handleScroll}>
                            <List
                                rowCount={userList.length}
                                rowHeight={96}
                                height={height - 129}
                                width={width}
                                ref={ref => (this._list = ref)}
                                style={{
                                    outline: 'none',
                                    overflowX: false,
                                    overflowY: false,
                                }}
                                noRowsRenderer={() => (
                                    <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexGrow: "1 1 1" }}>
                                        <Typography variant="h5"><Translate id="noUsers" /></Typography>
                                    </div>
                                )}
                                rowRenderer={({ index, style }) => (
                                    <UserListItem
                                        user={userList[index]}
                                        style={isSm ? style :
                                            { paddingLeft: 64, paddingRight: 96, ...style }
                                        }
                                        received={false}
                                        key={userList[index].usernmae}
                                        onRequestRefresh={this.reloadViewContents}
                                    />
                                )}
                            />
                        </Scrollbars>
                    </Fade>
                </div>
                <Zoom in>
                    <Tooltip title={translate("createUser")} placement="left">
                        <Fab
                            className={classes.fab}
                            color="primary"
                            onClick={() => {
                                this.setState({ isCreationModalShowing: true })
                            }}
                        >
                            <CreateIcon />
                        </Fab>
                    </Tooltip>
                </Zoom>
                <UserAdminModal
                    forCreation
                    open={isCreationModalShowing}
                    onRequestClose={() => {
                        this.setState({ isCreationModalShowing: false })
                    }}
                    onRequestRefresh={this.reloadViewContents}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    isLoggedIn: state.authentication.validity
})

const mapDispatchToProps = {
    requestUserList,
    removeSearchAction,
    replaceSearchAction,
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(UserPage)))