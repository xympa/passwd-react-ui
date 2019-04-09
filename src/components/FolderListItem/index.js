import React from 'react'
import PropTypes from 'prop-types'
import { ListItem, Avatar, ListItemText, Typography } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder'
import { withLocalize, Translate } from 'react-localize-redux'
import { withStyles } from '@material-ui/core/styles'
import localization from './localization.json'
import FolderAdministrationModal from '../FolderAdministrationModal'


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


class FolderListItem extends React.Component {

    static propTypes = {
        classes: PropTypes.object.isRequired,
        folder: PropTypes.object.isRequired,
        onClick: PropTypes.func,
        style: PropTypes.object,
        addTranslation: PropTypes.func.isRequired,
        onRequestRefresh: PropTypes.func.isRequired,
        folderModalOpen: PropTypes.bool.isRequired,
        closeModal: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            hovered: false
        }

        const { addTranslation } = this.props
        addTranslation(localization)
    }


    render() {
        const { classes, folder, style, onClick, folderModalOpen, onRequestRefresh, closeModal } = this.props;
        const { hovered } = this.state

        return (
            <div>
                <ListItem
                    style={{ ...style }}
                    button
                    onClick={onClick}
                    onMouseEnter={() => { this.setState({ hovered: true }) }}
                    onMouseLeave={() => { this.setState({ hovered: false }) }}
                    selected={hovered}
                >
                    <Avatar className={classes.avatar}>
                        <FolderIcon style={{ height: 32, width: 32 }} />
                    </Avatar>
                    <ListItemText
                        style={{ flex: 1 }}
                        primary={<Typography>{folder.name}</Typography>}
                        secondary={(
                            <Typography variant="caption" noWrap>
                                {folder.folderChildren}
                                <Translate id="foldersContained" />
                                {"; "}
                                {folder.credentialChildren}
                                <Translate id="credentialsContained" />
                            </Typography>
                        )}
                    />
                </ListItem>
                <FolderAdministrationModal
                    folderId={folder.idFolders}
                    open={folderModalOpen}
                    closeModal={closeModal}
                    onRequestRefresh={onRequestRefresh}
                />
            </div>
        )
    }
}

export default withStyles(styles)(withLocalize(FolderListItem))