import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { Scrollbars } from 'react-custom-scrollbars'
import { Fade, Typography, Zoom, Fab, Divider, Tooltip, CircularProgress } from '@material-ui/core'
import { List } from 'react-virtualized';
import CreateIcon from '@material-ui/icons/Create'
import { withLocalize, Translate } from 'react-localize-redux'
import localization from './localization.json'
import { composeMessage, fetchOutbox } from '../../actions/MessageActions'
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

export class OutboxView extends Component {
    static propTypes = {
        messages: PropTypes.array.isRequired,
        fetchOutbox: PropTypes.func.isRequired,
        removeSearchAction: PropTypes.func.isRequired,
        replaceSearchAction: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        composeMessage: PropTypes.func.isRequired,
        translate: PropTypes.func.isRequired,
        addTranslation: PropTypes.func.isRequired,
        isLoggedIn: PropTypes.bool.isRequired,
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

        const { addTranslation } = this.props
        addTranslation(localization)
    }

    componentDidMount() {
        const { isLoggedIn } = this.props;

        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        // replaceSearchAction()
        if(isLoggedIn)
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
        const { fetchOutbox } = this.props;

        this.setState({ isFetching: true }, () => {
            fetchOutbox()
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

        const { messages, classes, composeMessage, translate } = this.props;

        const isSm = window.innerWidth <= 600

        return (
            <div>
                <div style={{ flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <div className={classes.header}>
                        <Typography variant="h4"><Translate id="outbox" /></Typography>
                    </div>
                    <Divider />
                    <Fade in={isFetching}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: height - 138, position: "absolute", width: width }}>
                            <CircularProgress />
                        </div>
                    </Fade>
                    <Fade in={!isFetching}>
                        <Scrollbars style={{ width, height: height - 138 }} onScroll={this.handleScroll}>
                            <List
                                rowCount={messages.length}
                                rowHeight={96}
                                height={height - 138}
                                width={width}
                                ref={ref => (this._list = ref)}
                                style={{
                                    outline: 'none',
                                    overflowX: false,
                                    overflowY: false,
                                }}
                                noRowsRenderer={() => (
                                    <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexGrow: "1 1 1" }}>
                                        <Typography variant="h5">
                                            <Translate id="noMessages" />
                                        </Typography>
                                    </div>
                                )}
                                rowRenderer={({ index, style }) => (
                                    <MessageListItem
                                        {...messages[index]}
                                        messageId={messages[index].idMessages}
                                        ref={ref => (this._list = ref)}
                                        style={isSm ? style :
                                            { paddingLeft: 64, paddingRight: 96, ...style }
                                        }
                                        received={false}
                                        key={messages[index].idMessages + ''}
                                    />
                                )}
                            />
                        </Scrollbars>
                    </Fade>
                </div>
                <Zoom in>
                    <Tooltip title={translate("composeMessage")} placement="left">
                        <Fab className={classes.fab} color="primary" onClick={() => { composeMessage() }}>
                            <CreateIcon />
                        </Fab>
                    </Tooltip>
                </Zoom>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    messages: state.messages.outbox,
    isLoggedIn: state.authentication.validity
})

const mapDispatchToProps = {
    fetchOutbox,
    removeSearchAction,
    replaceSearchAction,
    composeMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(OutboxView)))