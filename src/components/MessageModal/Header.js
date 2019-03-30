import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CloseIcon from '@material-ui/icons/Close'
import { IconButton, Typography, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { withLocalize, Translate } from 'react-localize-redux'
import { closeModal } from '../../actions/MessageActions'

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit,
        flex: 0
    }
})

const MessageModalHeader = withLocalize((props) => {
    const { classes, closeModal, isCreating, readonly, translate } = props;

    return (
        <div style={{ display: "flex", flex: 0, flexWrap: "nowrap" }}>
            {!readonly && (
                isCreating ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h5"><Translate id="createMessageModalHeader" /></Typography>
                    </div>
                ) : (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="h5"><Translate id="savingCredential" /></Typography>
                        </div>
                    )
            )
            }
            <div style={{ flex: 1 }} />
            <Tooltip title={translate("closeModal")}>
                <IconButton aria-label="Delete" className={classes.margin} onClick={closeModal}>
                    <CloseIcon color="secondary" />
                </IconButton>
            </Tooltip>
        </div>
    )
})

MessageModalHeader.propTypes = {
    classes: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
    isCreating: PropTypes.bool.isRequired,
    readonly: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => ({
    isCreating: state.messages.modal.isCreating,
    readonly: state.messages.modal.readonly
})

const mapDispatchToProps = {
    closeModal
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MessageModalHeader))
