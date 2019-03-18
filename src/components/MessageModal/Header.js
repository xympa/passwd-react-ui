import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CloseIcon from '@material-ui/icons/Close'
import { IconButton, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import { closeModal } from '../../actions/MessageActions'

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit,
        flex: 0
    }
})

const MessageModalHeader = (props) => {
    const { classes, closeModal, isCreating, readonly } = props;

    return (
        <div style={{ display: "flex", flex: 0, flexWrap: "nowrap" }}>
            {!readonly && (
                isCreating ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h5">Insert the details of the new message</Typography>
                    </div>
                ) : (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="h5">Saving credential...</Typography>
                        </div>
                    )
            )
            }
            <div style={{ flex: 1 }} />
            <IconButton aria-label="Delete" className={classes.margin} onClick={closeModal}>
                <CloseIcon color="secondary" />
            </IconButton>
        </div>
    )
}

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
