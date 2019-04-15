import React from 'react'
import PropTypes from 'prop-types'
import { Divider, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, BottomNavigationAction } from '@material-ui/core'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { List as VirtualList } from 'react-virtualized'

import MailIcon from '@material-ui/icons/Mail'
import InboxIcon from '@material-ui/icons/Inbox'
import OutboxIcon from '@material-ui/icons/Send'
import HomeIcon from '@material-ui/icons/Home'
import AdministrationIcon from '@material-ui/icons/Build'
import FolderManagementIcon from '@material-ui/icons/FolderShared'
import UserManagementIcon from '@material-ui/icons/SupervisorAccount'
import LogsIcon from '@material-ui/icons/ListAlt'
import { Scrollbars } from 'react-custom-scrollbars';
import { withLocalize, Translate } from 'react-localize-redux'
import { drawerWidth } from './index'

import RootFolderListItem from './RootFolderListItem';
import HighlightableListItem from '../HighlightableListItem';
import { measureElement } from '../../Utils';

const styles = theme => ({
    noPadding: {
        padding: "0px 0px !important"
    },
    orangeAvatar: {
        backgroundColor: theme.palette.secondary.main
    },
    subListItem: {
        paddingLeft: theme.spacing.unit * 4
    }
});

const rootFolderItemHeight = 48

class DrawerContent extends React.PureComponent {

    static propTypes = {
        rootFolders: PropTypes.array.isRequired,
        classes: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        actions: PropTypes.array.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            rootFolderSectionHeight: 0,
            width: window.innerWidth,
            height: window.innerHeight,
        }

        this.calculateRootFolderHeight = this.calculateRootFolderHeight.bind(this)
    }

    componentDidMount() {
        this.updateWindowDimensions();
    }

    componentDidUpdate(prevProps, prevState) {
        this.calculateRootFolderHeight()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: measureElement(this).width, height: window.innerHeight });
    }


    calculateRootFolderHeight() {
        const { rootFolders } = this.props
        const { height } = this.state

        const virtualRootFolderSectionHeight = 48 * rootFolders.length + 70
        const messageSectionHeight = 170
        const sysAdminSectionHeight = 216

        const restSectionHeight = height - 66 - messageSectionHeight - sysAdminSectionHeight;

        this.setState({
            rootFolderSectionHeight: (virtualRootFolderSectionHeight < restSectionHeight ? virtualRootFolderSectionHeight : restSectionHeight - 20) - 70
        })

    }

    handleScroll = ({ target }) => {
        const { scrollTop } = target;
        this._list.scrollToPosition(scrollTop);
    };


    render() {
        const { rootFolders, classes, history, actions } = this.props;
        const { rootFolderSectionHeight } = this.state

        return (
            <div>
                <List style={{ paddingTop: 0 }}>
                    <Link to="/home" style={{ textDecoration: "none" }}>
                        <ListItem button>
                            <ListItemIcon><Avatar className={classes.orangeAvatar}><HomeIcon /></Avatar></ListItemIcon>
                            <ListItemText primary={<Typography variant="body1"><Translate id="credentialExplorer" /></Typography>} />
                        </ListItem>
                    </Link>
                    <Scrollbars style={{ width: drawerWidth, height: rootFolderSectionHeight }} onScroll={this.handleScroll}>
                        <VirtualList
                            rowCount={rootFolders.length}
                            rowHeight={48}
                            height={rootFolders.length * rootFolderItemHeight}
                            ref={ref => (this._list = ref)}
                            width={drawerWidth}
                            style={{
                                overflowX: false,
                                overflowY: false,
                                outline: 'none'
                            }}
                            rowRenderer={({ index, style }) => (
                                <RootFolderListItem
                                    style={style}
                                    className={classes.subListItem}
                                    key={rootFolders[index].idFolders}
                                    name={rootFolders[index].name}
                                    id={rootFolders[index].idFolders}
                                />
                            )}
                        />
                    </Scrollbars>
                </List>
                <Divider />
                <List>
                    <ListItem>
                        <ListItemIcon><Avatar className={classes.orangeAvatar}><MailIcon /></Avatar></ListItemIcon>
                        <ListItemText primary={<Typography variant="body1"><Translate id="messages" /></Typography>} />
                    </ListItem>
                    <Link to="/inbox" style={{ textDecoration: "none" }}>
                        <HighlightableListItem className={classes.subListItem} button>
                            <ListItemIcon><InboxIcon color="primary" /></ListItemIcon>
                            <ListItemText primary={<Typography noWrap variant="body2"><Translate id="inbox" /></Typography>} />
                        </HighlightableListItem>
                    </Link>
                    <Link to="/outbox" style={{ textDecoration: "none" }}>
                        <HighlightableListItem className={classes.subListItem}>
                            <ListItemIcon><OutboxIcon color="primary" /></ListItemIcon>
                            <ListItemText primary={<Typography noWrap variant="body2"><Translate id="outbox" /></Typography>} />
                        </HighlightableListItem>
                    </Link>
                </List>
                <Divider />
                {
                    (actions || []).includes("accessSysAdminArea") && (
                        <List>
                            <ListItem>
                                <ListItemIcon><Avatar className={classes.orangeAvatar}><AdministrationIcon /></Avatar></ListItemIcon>
                                <ListItemText primary={<Typography variant="body1"><Translate id="administration" /></Typography>} />
                            </ListItem>
                            <Link to='/folder-administration' style={{ textDecoration: "none" }}>
                                <HighlightableListItem className={classes.subListItem}>
                                    <ListItemIcon><FolderManagementIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary={<Typography noWrap variant="body2"><Translate id="folderManagement" /></Typography>} />
                                </HighlightableListItem>
                            </Link>
                            <Link to='/user-administration' style={{ textDecoration: "none" }}>
                                <HighlightableListItem className={classes.subListItem}>
                                    <ListItemIcon><UserManagementIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary={<Typography noWrap variant="body2"><Translate id="userManagement" /></Typography>} />
                                </HighlightableListItem>
                            </Link>
                            <Link to='/logs' style={{ textDecoration: "none" }}>
                                <HighlightableListItem className={classes.subListItem}>
                                    <ListItemIcon><LogsIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary={<Typography noWrap variant="body2"><Translate id="logExplorer" /></Typography>} />
                                </HighlightableListItem>
                            </Link>
                        </List>
                    )
                }
            </div >
        )
    }
}

const mapStateToProps = (state) => ({
    rootFolders: state.rootFolders.list,
    actions: state.authentication.actions
})


const mapDispatchToProps = {
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withLocalize(DrawerContent))))
