import React from 'react'
import PropTypes from 'prop-types'
import { ListItem, Avatar, ListItemText, Typography, Chip } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder'
import KeyIcon from '@material-ui/icons/VpnKey'
import { withRouter } from 'react-router-dom'
import GroupIcon from '@material-ui/icons/Group'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    avatar: {
        height: 64,
        width: 64,
        marginRight: 32,
        backgroundColor: theme.palette.secondary.main
    },
    hoveredRow: {
        height: 64,
        backgroundColor: "rgba(0,0,0,0.14)"
    },
    row: {
        height: 96
    },
    margin: {
        margin: 10
    }
});


const FolderListItem = (props) => {
    const { classes, folder, style, onClick } = props;

    return (
        <ListItem style={{ ...style }} button onClick={onClick}>
            <Avatar className={classes.avatar}>
                <FolderIcon style={{ height: 32, width: 32 }} />
            </Avatar>
            <ListItemText
                style={{ flex: 1 }}
                primary={<Typography>{folder.name}</Typography>}
                secondary={<Typography variant="caption" noWrap>Criada por: yay</Typography>}
            />
            <div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
                <Chip
                    className={classes.margin}
                    avatar={<Avatar><FolderIcon color="primary" /></Avatar>}
                    label={`${folder.folderChildren} pastas contidas`}
                />
                <Chip
                    className={classes.margin}
                    avatar={<Avatar><KeyIcon color="primary" /></Avatar>}
                    label={`${folder.credentialChildren} credenciais contidas`}
                />
                {/*<Chip className={classes.margin} avatar={<Avatar><GroupIcon color="primary" /></Avatar>} label="? outras pessoas têm acesso" />*/}
            </div>
        </ListItem>
    )
}

FolderListItem.propTypes = {
    classes: PropTypes.object.isRequired,
    folder: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    style: PropTypes.object
}

export default withStyles(styles)(withRouter(FolderListItem))