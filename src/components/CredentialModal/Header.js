import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CloseIcon from '@material-ui/icons/Close'
import ShareIcon from '@material-ui/icons/Share'
import LockIcon from '@material-ui/icons/Lock'
import OpenLockIcon from '@material-ui/icons/LockOpen'
import { IconButton } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { closeCredential, toggleEditMode } from '../../actions/CredentialActions'

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit,
        flex: 0
    }
})

const Header = (props) => {
    const { closeCredential, isEditing, classes, toggleEditMode } = props;

    return (
        <div style={{ display: "flex", flex: 0, flexWrap: "nowrap" }}>
            <IconButton aria-label="Delete" className={classes.margin} onClick={toggleEditMode}>
                {isEditing ? <LockIcon color="secondary" /> : <OpenLockIcon color="secondary" />}
            </IconButton>
            <IconButton aria-label="Delete" className={classes.margin}>
                <ShareIcon color="secondary" />
            </IconButton>
            <div style={{ flex: 1 }} />
            <IconButton aria-label="Delete" className={classes.margin} onClick={closeCredential}>
                <CloseIcon color="secondary" />
            </IconButton>
        </div>
    )
}

Header.propTypes = {
    isEditing: PropTypes.bool.isRequired,
    closeCredential: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    toggleEditMode: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
    isEditing: state.credential.isEditing
})

const mapDispatchToProps = {
    closeCredential,
    toggleEditMode
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Header))
