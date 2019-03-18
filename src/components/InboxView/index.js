import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { Fade, Typography, Zoom, Fab, Divider } from '@material-ui/core'
import { List } from 'react-virtualized';
import CreateIcon from '@material-ui/icons/Create'
import { fetchInbox, composeMessage } from '../../actions/MessageActions'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import { measureElement } from '../../Utils'
import MessageListItem from '../MessageListItem';

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

export class InboxView extends Component {
    static propTypes = {
        messages: PropTypes.array.isRequired,
        fetchInbox: PropTypes.func.isRequired,
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
        const { fetchInbox } = this.props;

        this.setState({ isFetching: true }, () => {
            fetchInbox()
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

        const { messages, classes, composeMessage } = this.props;

        return (
            <div>
                <div style={{ flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <div className={classes.header}>
                        <Typography variant="h4">Inbox</Typography>
                    </div>
                    <Divider />
                    <Fade in={!isFetching}>
                        <List
                            rowCount={messages.length}
                            rowHeight={96}
                            height={height - 138}
                            width={width}
                            style={{ outline: 'none' }}
                            noRowsRenderer={() => (
                                <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexGrow: "1 1 1" }}>
                                    <Typography variant="h5">No messages... :(</Typography>
                                </div>
                            )}
                            rowRenderer={({ index, style }) => (
                                <MessageListItem
                                    {...messages[index]}
                                    messageId={messages[index].idMessages}
                                    style={{ paddingLeft: 64, paddingRight: 96, ...style }}
                                    received
                                    key={messages[index].idMessages + ''}
                                />
                            )}
                        />
                    </Fade>
                </div>
                <Zoom in>
                    <Fab className={classes.fab} color="secondary" onClick={() => { composeMessage() }}>
                        <CreateIcon />
                    </Fab>
                </Zoom>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    messages: state.messages.inbox
})

const mapDispatchToProps = {
    fetchInbox,
    removeSearchAction,
    replaceSearchAction,
    composeMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(InboxView))
