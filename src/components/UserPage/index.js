import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { Fade, Typography, Zoom, Fab, Divider, Tooltip } from '@material-ui/core'
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
        const { replaceSearchAction } = this.props
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        replaceSearchAction(this.reloadViewContents)
        this.reloadViewContents()
    }

    componentWillUnmount() {
        const { removeSearchAction } = this.props;
        removeSearchAction();
        window.removeEventListener('resize', this.updateWindowDimensions);
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

        return (
            <div>
                <div className={classes.header}>
                    <Typography variant="h4">
                        <Translate id="userManagement" />
                    </Typography>
                </div>
                <Divider />
                <div style={{ flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <Fade in={!isFetching}>
                        <List
                            rowCount={userList.length}
                            rowHeight={96}
                            height={height - 129}
                            width={width}
                            style={{ outline: 'none' }}
                            noRowsRenderer={() => (
                                <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexGrow: "1 1 1" }}>
                                    <Typography variant="h5"><Translate id="noUsers" /></Typography>
                                </div>
                            )}
                            rowRenderer={({ index, style }) => (
                                <UserListItem
                                    user={userList[index]}
                                    style={{ paddingLeft: 64, paddingRight: 96, ...style }}
                                    received={false}
                                    key={userList[index].usernmae}
                                    onRequestRefresh={this.reloadViewContents}
                                />
                            )}
                        />
                    </Fade>
                </div>
                <Zoom in>
                    <Tooltip title={translate("createUser")} placement="left">
                        <Fab
                            className={classes.fab}
                            color="secondary"
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
})

const mapDispatchToProps = {
    requestUserList,
    removeSearchAction,
    replaceSearchAction,
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(UserPage)))