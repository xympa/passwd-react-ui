import React from 'react'
import PropTypes from 'prop-types'
import CloseIcon from '@material-ui/icons/Close'
import LockIcon from '@material-ui/icons/Lock'
import OpenLockIcon from '@material-ui/icons/LockOpen'
import { IconButton, Typography, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { withLocalize, Translate } from 'react-localize-redux'

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit,
        flex: 0
    }
})

const Header = withLocalize((props) => {
    const { closeModal, isEditing, classes, toggleEditMode, isCreating, translate } = props;

    return (
        <div style={{ display: "flex", flex: 0, flexWrap: "nowrap" }}>
            {!isCreating ? (
                <Tooltip title={isEditing ? translate("lockModal") : translate("unlockModal")}>
                    <IconButton aria-label="Delete" className={classes.margin} onClick={toggleEditMode}>
                        {isEditing ? <LockIcon color="secondary" /> : <OpenLockIcon color="secondary" />}
                    </IconButton>
                </Tooltip>
            ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h5">
                            <Translate id="createUserModalHeader" />
                        </Typography>
                    </div>
                )}
            <div style={{ flex: 1 }} />
            <Tooltip title={translate("closeModal")}>
                <IconButton aria-label="Delete" className={classes.margin} onClick={closeModal}>
                    <CloseIcon color="secondary" />
                </IconButton>
            </Tooltip>
        </div>
    )
})

Header.propTypes = {
    isEditing: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    toggleEditMode: PropTypes.func.isRequired,
    isCreating: PropTypes.bool.isRequired,
    translate: PropTypes.func.isRequired,
}
export default withStyles(styles)(Header)
