import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { Fade, Typography, Zoom, Fab, Divider } from '@material-ui/core'
import { List } from 'react-virtualized';
import CreateIcon from '@material-ui/icons/Create'
import { fetchUserList } from '../../actions/UserActions'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import { measureElement } from '../../Utils'
import UserListItem from '../UserListItem';

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
        messages: PropTypes.array.isRequired,
        fetchOutbox: PropTypes.func.isRequired,
        removeSearchAction: PropTypes.func.isRequired,
        replaceSearchAction: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        composeMessage: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            isFetching: true,
            error: undefined,
            width: window.innerWidth,
            height: window.innerHeight,
        }

        this.reloadViewContents = this.reloadViewContents.bind(this)
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        // replaceSearchAction()
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
        const { fetchUserList } = this.props;

        

        this.setState({ isFetching: true }, () => {
            fetchUserList()
                .catch(error => {
                    this.setState({
                        error: error
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

        const { isFetching, error, width, height } = this.state;

        const { users, classes, createUser } = this.props;

        console.log(this.props)

        return (
            <div>
                <div className={classes.header}>

                </div>
                <Divider />
                <div style={{ flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <Fade in={!isFetching}>
                        <List
                            rowCount={users.length}
                            rowHeight={96}
                            height={height - 129}
                            width={width}
                            style={{ outline: 'none' }}
                            noRowsRenderer={() => (
                                <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexGrow: "1 1 1" }}>
                                    <Typography variant="h5">WHAAAAAT How can there be no users, who are you? D:</Typography>
                                </div>
                            )}
                            rowRenderer={({ index, style }) => (
                                <UserListItem
                                    user={users[index]}
                                    style={{ paddingLeft: 64, paddingRight: 96, ...style }}
                                    received={false}
                                    key={users[index].usernmae}
                                />
                            )}
                        />
                    </Fade>
                </div>
                <Zoom in>
                    <Fab className={classes.fab} color="secondary" onClick={() => { createUser() }}>
                        <CreateIcon />
                    </Fab>
                </Zoom>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    users: state.user.list
})

const mapDispatchToProps = {
    fetchUserList,
    removeSearchAction,
    replaceSearchAction
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserPage))