import React from 'react'
import PropTypes from 'prop-types'
import CloseIcon from '@material-ui/icons/Close'
import LockIcon from '@material-ui/icons/Lock'
import OpenLockIcon from '@material-ui/icons/LockOpen'
import { IconButton, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit,
        flex: 0
    }
})

const Header = (props) => {
    const { closeModal, isEditing, classes, toggleEditMode, isCreating } = props;

    return (
        <div style={{ display: "flex", flex: 0, flexWrap: "nowrap" }}>
            {!isCreating ? (
                <div>
                    <IconButton aria-label="Delete" className={classes.margin} onClick={toggleEditMode}>
                        {isEditing ? <LockIcon color="secondary" /> : <OpenLockIcon color="secondary" />}
                    </IconButton>
                </div>
            ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h5">Insert the details of the new user</Typography>
                    </div>
                )}
            <div style={{ flex: 1 }} />
            <IconButton aria-label="Delete" className={classes.margin} onClick={closeModal}>
                <CloseIcon color="secondary" />
            </IconButton>
        </div>
    )
}

Header.propTypes = {
    isEditing: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    toggleEditMode: PropTypes.func.isRequired,
    isCreating: PropTypes.bool.isRequired,
}
export default withStyles(styles)(Header)
