import React from 'react'
import PropTypes from 'prop-types'
import { Divider, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar } from '@material-ui/core'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'

import MailIcon from '@material-ui/icons/Mail'
import InboxIcon from '@material-ui/icons/Inbox'
import OutboxIcon from '@material-ui/icons/Send'
import HomeIcon from '@material-ui/icons/Home'
import AdministrationIcon from '@material-ui/icons/Build'
import FolderManagementIcon from '@material-ui/icons/FolderShared'
import UserManagementIcon from '@material-ui/icons/SupervisorAccount'
import LogsIcon from '@material-ui/icons/ListAlt'

import RootFolderListItem from './RootFolderListItem';
import { openFolder } from '../../actions/FolderActions';
import HighlightableListItem from '../HighlightableListItem';

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

const DrawerContent = props => {
    const { rootFolders, classes, history, openFolder } = props;

    return (
        <div>
            <List>
                <ListItem button onClick={() => { history.push('/home'); openFolder(null); }}>
                    <ListItemIcon><Avatar className={classes.orangeAvatar}><HomeIcon /></Avatar></ListItemIcon>
                    <ListItemText primary={<Typography variant="body1">Explorador de credenciais</Typography>} />
                </ListItem>
                {
                    rootFolders.map(folder => (
                        <RootFolderListItem className={classes.subListItem} key={folder.idFolders} name={folder.name} id={folder.idFolders} />
                    ))
                }
            </List>
            <Divider />
            <List>
                <ListItem>
                    <ListItemIcon><Avatar className={classes.orangeAvatar}><MailIcon /></Avatar></ListItemIcon>
                    <ListItemText primary={<Typography variant="body1">Mensagens</Typography>} />
                </ListItem>
                <HighlightableListItem className={classes.subListItem} button onClick={() => { history.push('/inbox'); }}>
                    <ListItemIcon><InboxIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={<Typography noWrap variant="body2">Inbox</Typography>} />
                </HighlightableListItem>
                <HighlightableListItem className={classes.subListItem} onClick={() => { history.push('/outbox'); }}>
                    <ListItemIcon><OutboxIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={<Typography noWrap variant="body2">Outbox</Typography>} />
                </HighlightableListItem>
            </List>
            <Divider />
            <List>
                <ListItem>
                    <ListItemIcon><Avatar className={classes.orangeAvatar}><AdministrationIcon /></Avatar></ListItemIcon>
                    <ListItemText primary={<Typography variant="body1">Administração</Typography>} />
                </ListItem>
                <HighlightableListItem className={classes.subListItem} onClick={() => { history.push('/folder-administration'); }}>
                    <ListItemIcon><FolderManagementIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={<Typography noWrap variant="body2">Gerir Pastas</Typography>} />
                </HighlightableListItem>
                <HighlightableListItem className={classes.subListItem} onClick={() => { history.push('/user-administration'); }}>
                    <ListItemIcon><UserManagementIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={<Typography noWrap variant="body2">Utilizadores</Typography>} />
                </HighlightableListItem>
                <HighlightableListItem className={classes.subListItem} onClick={() => { history.push('/logs'); }}>
                    <ListItemIcon><LogsIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={<Typography noWrap variant="body2">Logs</Typography>} />
                </HighlightableListItem>
            </List>
        </div>
    )
}

DrawerContent.propTypes = {
    rootFolders: PropTypes.array.isRequired,
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    openFolder: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
    rootFolders: state.rootFolders.list
})


const mapDispatchToProps = {
    openFolder
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(DrawerContent)))
