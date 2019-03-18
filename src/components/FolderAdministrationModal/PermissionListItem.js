import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles';
import PersonIcon from '@material-ui/icons/Person'
import DeleteIcon from '@material-ui/icons/Delete'
import BuildIcon from '@material-ui/icons/Build'
import { Checkbox, ListItem, ListItemAvatar, ListItemSecondaryAction, IconButton, Avatar, ListItemText, FormControlLabel, Fade } from '@material-ui/core';

const styles = theme => ({
    disabledAvatar: {
      margin: 10,
    },
    adminAvatar: {
      margin: 10,
      color: '#fff',
      backgroundColor: theme.palette.secondary.main,
    },
    userAvatar: {
      margin: 10,
      color: '#fff',
      backgroundColor: theme.palette.primary.main,
    },
    deleteButton: {
        backgroundColor: theme.palette.error.main
    }
  });
  

const PermissionListItem = (props) => {

    const { hasAdmin, userId, adminChanged, isEditing, permissionRemoved, classes } = props;

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar className={!isEditing ? classes.disabledAvatar : (hasAdmin == 1 ? classes.adminAvatar : classes.userAvatar)}>
                    {hasAdmin == 1 ? <BuildIcon /> : <PersonIcon />}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={userId}
            />
            <FormControlLabel
                control={(
                    <Checkbox
                        checked={hasAdmin == 1}
                        onChange={(event, checked) => { adminChanged(userId, checked) }}
                        value="checkedB"
                        color="primary"
                    />)
                }
                label="Is folder administrator?"
                style={{ marginRight: 32 }}
                disabled={!isEditing}
            />
            <Fade in>
                <ListItemSecondaryAction>
                    <IconButton disabled={!isEditing} aria-label="Delete" onClick={() => permissionRemoved(userId)}>
                        <DeleteIcon color={!isEditing ? "disabled" : "error"} />
                    </IconButton>
                </ListItemSecondaryAction>
            </Fade>
        </ListItem>
    )
}

PermissionListItem.propTypes = {
    userId: PropTypes.string.isRequired,
    hasAdmin: PropTypes.string.isRequired,
    adminChanged: PropTypes.func.isRequired,
    isEditing: PropTypes.bool.isRequired,
    permissionRemoved: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(PermissionListItem)
