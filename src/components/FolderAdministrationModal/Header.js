import React from 'react'
import PropTypes from 'prop-types'
import CloseIcon from '@material-ui/icons/Close'
import LockIcon from '@material-ui/icons/Lock'
import { Translate, withLocalize } from 'react-localize-redux'
import OpenLockIcon from '@material-ui/icons/LockOpen'
import { IconButton, Typography, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import localization from './localization.json'

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit,
        flex: 0
    }
})

class Header extends React.PureComponent {
    static propTypes = {
        isEditing: PropTypes.bool.isRequired,
        closeAdmin: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        toggleEditMode: PropTypes.func.isRequired,
        isCreating: PropTypes.bool.isRequired,
        addTranslation: PropTypes.func.isRequired,
        translate: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {

        }

        const { addTranslation } = this.props
        addTranslation(localization)
    }


    render() {
        const { closeAdmin, isEditing, classes, toggleEditMode, isCreating, translate } = this.props;

        return (
            <div style={{ display: "flex", flex: 0, flexWrap: "nowrap" }}>
                {!isCreating ? (
                    <div>
                        <Tooltip title={isEditing ? translate("lockModal") : translate("unlockModal")}>
                            <IconButton aria-label="Delete" className={classes.margin} onClick={toggleEditMode}>
                                {isEditing ? <LockIcon color="secondary" /> : <OpenLockIcon color="secondary" />}
                            </IconButton>
                        </Tooltip>
                    </div>
                ) : (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="h5"><Translate id="folderModalHeader" /></Typography>
                        </div>
                    )}
                <div style={{ flex: 1 }} />
                <Tooltip title={translate("closeModal")}>
                    <IconButton aria-label="Delete" className={classes.margin} onClick={closeAdmin}>
                        <CloseIcon color="secondary" />
                    </IconButton>
                </Tooltip>
            </div>
        )
    }
}

export default withStyles(styles)(withLocalize(Header))
