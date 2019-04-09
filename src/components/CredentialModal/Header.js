import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CloseIcon from '@material-ui/icons/Close'
import ShareIcon from '@material-ui/icons/Share'
import LockIcon from '@material-ui/icons/Lock'
import OpenLockIcon from '@material-ui/icons/LockOpen'
import { IconButton, Typography, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { Translate, withLocalize } from 'react-localize-redux'
import { composeMessage } from '../../actions/MessageActions'

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit,
        flex: 0
    }
})

const Header = (props) => {
    const { closeCredential, isEditing, classes, toggleEditMode, isCreating, credentialId, composeMessage, translate } = props;

    return (
        <div style={{ display: "flex", flex: 0, flexWrap: "nowrap" }}>
            {!isCreating ? (
                <div>
                    <Tooltip title={isEditing ? translate("lockModal") : translate("unlockModal")}>
                        <IconButton aria-label="Delete" className={classes.margin} onClick={toggleEditMode}>
                            {isEditing ? <LockIcon color="secondary" /> : <OpenLockIcon color="secondary" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={translate("shareCredential")}>
                        <IconButton aria-label={translate("shareCredential")} className={classes.margin} onClick={() => { composeMessage(credentialId) }}>
                            <ShareIcon color="secondary" />
                        </IconButton>
                    </Tooltip>
                </div>
            ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h5"><Translate id="credentialModalHeader" /></Typography>
                    </div>
                )}
            <div style={{ flex: 1 }} />
            <Tooltip title={translate("closeModal")}>
                <IconButton aria-label="Delete" className={classes.margin} onClick={closeCredential}>
                    <CloseIcon color="secondary" />
                </IconButton>
            </Tooltip>
        </div>
    )
}

Header.propTypes = {
    isEditing: PropTypes.bool.isRequired,
    closeCredential: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    toggleEditMode: PropTypes.func.isRequired,
    isCreating: PropTypes.bool.isRequired,
    credentialId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    composeMessage: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = {
    composeMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(Header)))
