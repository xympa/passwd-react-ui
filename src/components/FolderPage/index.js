/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IconButton, Zoom, Fab, Fade, Divider, Typography, Tooltip } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home'
import UpArrowIcon from '@material-ui/icons/ArrowUpward'
import SettingsIcon from '@material-ui/icons/Settings'
import AddIcon from '@material-ui/icons/Add'
import FolderIcon from '@material-ui/icons/Folder'
import KeyIcon from '@material-ui/icons/VpnKey'
import { withStyles } from '@material-ui/core/styles'
import { List } from 'react-virtualized'
import { openFolder, fetchFolderContents, updateContents } from '../../actions/FolderActions'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import FolderListItem from '../FolderListItem';
import CredentialListItem from '../CredentialListItem'
import FolderBreadcrumbs from '../FolderBreadcrumbs'
import { beginCredentialCreation } from '../../actions/CredentialActions'
import PopupFab from '../PopupFab'
import { adminFolder, beginCreation as beginFolderCreation } from '../../actions/FolderAdminActions'
import { measureElement } from '../../Utils'
import { withLocalize, Translate } from 'react-localize-redux';
import localization from './localization.json'

const styles = () => ({
    header: {
        display: "flex",
        height: 64,
        paddingLeft: 64,
        paddingRight: 64
    }
});



export class FolderPage extends Component {
    static propTypes = {
        openFolder: PropTypes.func,
        replaceSearchAction: PropTypes.func.isRequired,
        updateContents: PropTypes.func.isRequired,
        removeSearchAction: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        contents: PropTypes.arrayOf(PropTypes.object),
        isFetching: PropTypes.bool.isRequired,
        openFolderId: PropTypes.any,
        beginCredentialCreation: PropTypes.func.isRequired,
        adminFolder: PropTypes.func.isRequired,
        beginFolderCreation: PropTypes.func.isRequired,
        match: PropTypes.object.isRequired,
        parent: PropTypes.string.isRequired,
        history: PropTypes.object.isRequired,
        addTranslation: PropTypes.func.isRequired,
        translate: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            width: window.innerWidth, height: window.innerHeight,
        }

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this._upButtonHandle = this._upButtonHandle.bind(this)
        this._homeButtonHandle = this._homeButtonHandle.bind(this)
        this.refreshView = this.refreshView.bind(this)

        const { addTranslation } = this.props
        addTranslation(localization)
    }

    componentDidMount() {
        const { replaceSearchAction, updateContents, openFolder, match } = this.props;

        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        replaceSearchAction(updateContents);
        openFolder(match.params.id || null);
    }

    componentDidUpdate(prevProps) {
        const { match, openFolder } = this.props;
        if (prevProps.match.params.id != match.params.id)
            openFolder(match.params.id || null);
    }


    componentWillUnmount() {
        const { removeSearchAction } = this.props;
        removeSearchAction();
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: measureElement(this).width, height: window.innerHeight });
    }

    _homeButtonHandle() {
        const { history } = this.props;
        history.push('/home')
    }

    _upButtonHandle() {
        const { history, parent } = this.props;
        history.push(`/home/${parent || ''}`)
    }

    refreshView(resolve, reject) {
        const { openFolder, match } = this.props;
        openFolder(match.params.id)
            .then(resolve)
            .catch(reject)
    }

    render() {
        const { classes, contents, isFetching, openFolderId, beginCredentialCreation, adminFolder, beginFolderCreation, history, translate } = this.props;
        const { width, height } = this.state;

        return (
            <div>
                <div style={{ flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <div className={classes.header}>
                        <IconButton disabled={openFolderId === null} color="secondary" style={{ width: 64 }} onClick={this._homeButtonHandle}>
                            <Tooltip title={translate("homeTooltip")} enterDelay={400} placement="bottom-start">
                                <HomeIcon style={{ fontSize: 32 }} />
                            </Tooltip>
                        </IconButton>
                        <IconButton disabled={openFolderId === null} color="secondary" style={{ width: 64 }} onClick={this._upButtonHandle}>
                            <Tooltip title={translate("parentTooltip")} enterDelay={400} placement="bottom-start">
                                <UpArrowIcon style={{ fontSize: 32 }} />
                            </Tooltip>
                        </IconButton>
                        <FolderBreadcrumbs />
                        <IconButton disabled={openFolderId === null} color="secondary" style={{ width: 64 }} onClick={() => { adminFolder() }}>
                            <Tooltip title={translate("folderAdminTooltip")} enterDelay={400} placement="bottom-start">
                                <SettingsIcon style={{ fontSize: 32 }} />
                            </Tooltip>
                        </IconButton>
                    </div>
                    <Divider />
                    <Fade in={!isFetching}>
                        <List
                            rowCount={contents.length}
                            rowHeight={96}
                            height={height - 138}
                            width={width}
                            style={{ outline: 'none' }}
                            noRowsRenderer={() => (
                                <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexGrow: "1 1 1" }}>
                                    <Typography variant="h5" align="center"><Translate id="emptyFolder" /></Typography>
                                </div>
                            )}
                            rowRenderer={({ index, style }) => {
                                const content = contents[index];

                                if (content.idFolders)
                                    return (
                                        <FolderListItem
                                            style={{ paddingLeft: 64, paddingRight: 96, ...style }}
                                            key={"folder-" + content.idFolders}
                                            folder={content}
                                            onClick={() => { history.push('/home/' + content.idFolders) }}
                                        />
                                    )
                                else
                                    return (
                                        <CredentialListItem
                                            style={{ paddingLeft: 64, paddingRight: 96, ...style }}
                                            key={"credential-" + content.idCredentials}
                                            credential={content}
                                        />
                                    )
                            }}
                        />
                    </Fade>
                </div>
                <Zoom
                    in={openFolderId !== null}
                    unmountOnExit
                >
                    <PopupFab mainFab={(
                        <Tooltip title={translate("addContent")} placement="left">
                            <Fab color="primary">
                                <AddIcon />
                            </Fab>
                        </Tooltip>

                    )}
                    >
                        <Tooltip key="folder-add" title={translate("addFolder")} placement="left">
                            <Fab size="small" color="secondary" onClick={() => { beginFolderCreation(openFolderId) }}><FolderIcon /></Fab>
                        </Tooltip>
                        <Tooltip key="credential-add" title={translate("addCredential")} placement="left">
                            <Fab size="small" color="secondary" onClick={beginCredentialCreation}><KeyIcon /></Fab>
                        </Tooltip>
                    </PopupFab>
                </Zoom>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    contents: [...state.folder.contents.credentials, ...state.folder.contents.folders],
    openFolderId: state.folder.openId,
    isFetching: state.folder.isFetching,
    parent: state.folder.folderInfo && state.folder.folderInfo.parent || null
})

const mapDispatchToProps = {
    openFolder,
    removeSearchAction,
    replaceSearchAction,
    fetchFolderContents,
    updateContents,
    beginCredentialCreation,
    adminFolder,
    beginFolderCreation
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(FolderPage)))