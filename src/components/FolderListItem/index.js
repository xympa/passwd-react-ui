import React from 'react'
import PropTypes from 'prop-types'
import { ListItem, Avatar, ListItemIcon, ListItemText, Typography, MenuItem } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { Link } from 'react-router-dom'
import { withLocalize, Translate } from 'react-localize-redux'
import { withStyles } from '@material-ui/core/styles'
import localization from './localization.json'
import FolderAdministrationModal from '../FolderAdministrationModal'
import ContextMenu from '../ContextMenu/index'


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
        translate: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            hovered: false
        }

        const { addTranslation } = this.props
        addTranslation(localization)
    }

    findHref(target) {
        var ele = target;
        while (!ele.href) {
            ele = ele.parentNode;
        }
        return ele.href;
    }


    render() {
        const { classes, folder, style, onClick, folderModalOpen, onRequestRefresh, closeModal, translate } = this.props;
        const { hovered } = this.state

        return (
            <div
                onContextMenu={e => { e.preventDefault() }}
            >
                <ContextMenu
                    items={[
                        <MenuItem onClick={onClick} key="open">
                            <ListItemIcon className={classes.icon}>
                                <OpenInBrowserIcon />
                            </ListItemIcon>
                            <ListItemText inset primary={translate("open")} />
                        </MenuItem>,
                        <Link
                            key="open-new-tab"
                            to={"/home/" + folder.idFolders}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{ textDecoration: "none" }}
                            onClick={(e) => { e.preventDefault(); window.open(this.findHref(e.target)); /* there should be a god damn better way to do this */ }}
                        >
                            <MenuItem>
                                <ListItemIcon className={classes.icon}>
                                    <OpenInNewIcon />
                                </ListItemIcon>
                                <ListItemText inset primary={translate("openInNewTab")} />
                            </MenuItem>
                        </Link>
                    ]}
                >
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
                </ContextMenu>
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