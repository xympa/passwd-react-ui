/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IconButton, Zoom, Fab, Fade, Divider, Typography, Tooltip } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home'
import UpArrowIcon from '@material-ui/icons/ArrowUpward'
import SettingsIcon from '@material-ui/icons/Settings'
import AddIcon from '@material-ui/icons/Add'
import { withLocalize, Translate } from 'react-localize-redux';
import { withSnackbar } from 'notistack';
import FolderIcon from '@material-ui/icons/Folder'
import KeyIcon from '@material-ui/icons/VpnKey'
import { withStyles } from '@material-ui/core/styles'
import { List } from 'react-virtualized'
import { requestFolderContents, requestFolderInfo, requestFolderPath } from '../../actions/FolderActions'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import FolderListItem from '../FolderListItem';
import CredentialListItem from '../CredentialListItem'
import FolderBreadcrumbs from '../FolderBreadcrumbs'
import PopupFab from '../PopupFab'
import { measureElement } from '../../Utils'
import localization from './localization.json'
import CredentialModal from '../CredentialModal';
import FolderAdministrationModal from '../FolderAdministrationModal';

const styles = () => ({
    header: {
        display: "flex",
        height: 64,
        paddingLeft: 64,
        paddingRight: 64
    }
});

const INITIAL_STATE = {
    width: 0,
    height: 0,
    isFetching: false,
    contents: [],
    creationModalOpen: false,
    folderModalOpen: false,
    folderCreationModalOpen: false,
    path: []
}

export class FolderPage extends Component {
    static propTypes = {
        replaceSearchAction: PropTypes.func.isRequired,
        removeSearchAction: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        adminFolder: PropTypes.func.isRequired,
        match: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        addTranslation: PropTypes.func.isRequired,
        translate: PropTypes.func.isRequired,
        requestFolderContents: PropTypes.func.isRequired,
        requestFolderInfo: PropTypes.func.isRequired,
        enqueueSnackbar: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            ...INITIAL_STATE,
            width: window.innerWidth,
            height: window.innerHeight,
        }

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this._upButtonHandle = this._upButtonHandle.bind(this)
        this._homeButtonHandle = this._homeButtonHandle.bind(this)
        this.refreshView = this.refreshView.bind(this)
        this._closeModal = this._closeModal.bind(this)
        this._openFolderModal = this._openFolderModal.bind(this)

        const { addTranslation } = this.props
        addTranslation(localization)
    }

    componentDidMount() {
        const { replaceSearchAction } = this.props;

        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        replaceSearchAction(this.refreshView);
        this.refreshView()
    }

    componentDidUpdate(prevProps) {
        const { match } = this.props;
        if (prevProps.match.params.id != match.params.id)
            this.refreshView()
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
        const { history } = this.props
        const { parent } = this.state
        history.push(`/home/${parent || ''}`)
    }

    refreshView(preOpenCred) {
        const { match, requestFolderContents, enqueueSnackbar, requestFolderInfo, requestFolderPath } = this.props;

        return new Promise((resolve, reject) => {
            this.setState({
                isFetching: true
            }, () => {
                Promise.all([
                    requestFolderContents(match.params.id),
                    requestFolderInfo(match.params.id),
                    requestFolderPath(match.params.id)
                ]).then(([contents, folderInfo, path]) => {
                    if (contents) {
                        this.setState({
                            contents: [...contents.folders, ...contents.credentials],
                            openModals: contents.credentials.map(c => ({ id: c.idCredentials, open: preOpenCred == c.idCredentials ? true : false })),
                            parent: folderInfo.folderInfo.parent || null,
                            creationModalOpen: false,
                            folderModalOpen: false,
                            folderCreationModalOpen: false,
                            path
                        }, () => {
                            resolve()
                        })
                    }
                })
                    .catch((error) => {
                        enqueueSnackbar(error.message, {
                            variant: "error"
                        })
                        reject()
                    })
                    .then(() => {
                        this.setState({ isFetching: false })
                    })
            })
        })
    }

    _closeModal() {
        this.setState(prevState => ({
            folderCreationModalOpen: false,
            folderModalOpen: false,
            creationModalOpen: false,
            openModals: prevState.openModals
                .map(m => ({
                    ...m,
                    open: false
                }))
        }))
    }

    _openFolderModal() {
        this.setState(prevState => ({
            folderCreationModalOpen: false,
            folderModalOpen: true,
            creationModalOpen: false,
            openModals: prevState.openModals
                .map(m => ({
                    ...m,
                    open: false
                }))
        }))
    }

    render() {
        const { classes, adminFolder, history, match, translate } = this.props;
        const { width, height, contents, openModals, isFetching, creationModalOpen, path, folderModalOpen, folderCreationModalOpen } = this.state;
        const openFolderId = match.params.id

        return (
            <div>
                <div style={{ flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <div className={classes.header}>
                        <IconButton disabled={!openFolderId} color="secondary" style={{ width: 64 }} onClick={this._homeButtonHandle}>
                            <Tooltip title={translate("homeTooltip")} enterDelay={400} placement="bottom-start">
                                <HomeIcon style={{ fontSize: 32 }} />
                            </Tooltip>
                        </IconButton>
                        <IconButton disabled={!openFolderId} color="secondary" style={{ width: 64 }} onClick={this._upButtonHandle}>
                            <Tooltip title={translate("parentTooltip")} enterDelay={400} placement="bottom-start">
                                <UpArrowIcon style={{ fontSize: 32 }} />
                            </Tooltip>
                        </IconButton>
                        <FolderBreadcrumbs path={path} />
                        <IconButton disabled={!openFolderId} color="secondary" style={{ width: 64 }} onClick={this._openFolderModal}>
                            <Tooltip title={translate("folderAdminTooltip")} enterDelay={400} placement="bottom-start">
                                <SettingsIcon style={{ fontSize: 32 }} />
                            </Tooltip>
                        </IconButton>
                        <FolderAdministrationModal
                            folderId={match.params.id}
                            open={folderModalOpen}
                            closeModal={this._closeModal}
                            onRequestRefresh={this.refreshView}
                        />
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
                                            modalOpen={openModals.find(m => m.id == content.idCredentials).open}
                                            openCredential={id => {
                                                this.setState({
                                                    folderCreationModalOpen: false,
                                                    folderModalOpen: false,
                                                    creationModalOpen: false,
                                                    openModals: openModals
                                                        .map(m => ({
                                                            ...m,
                                                            open: m.id == id ? true : false
                                                        }))
                                                })
                                            }}
                                            closeModal={this._closeModal}
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
                            <Fab
                                size="small"
                                color="secondary"
                                onClick={() => {
                                    this.setState({
                                        folderCreationModalOpen: true,
                                        folderModalOpen: false,
                                        creationModalOpen: false,
                                        openModals: openModals
                                            .map(m => ({
                                                ...m,
                                                open: false
                                            }))
                                    })
                                }}
                            >
                                <FolderIcon />
                            </Fab>
                        </Tooltip>
                        <Tooltip key="credential-add" title={translate("addCredential")} placement="left">
                            <Fab
                                size="small"
                                color="secondary"
                                onClick={() => {
                                    this.setState({
                                        folderCreationModalOpen: false,
                                        folderModalOpen: false,
                                        creationModalOpen: true,
                                        openModals: openModals
                                            .map(m => ({
                                                ...m,
                                                open: false
                                            }))
                                    })
                                }}
                            >
                                <KeyIcon />
                            </Fab>
                        </Tooltip>
                    </PopupFab>
                </Zoom>
                <CredentialModal
                    forCreation
                    open={creationModalOpen}
                    belongsTo={openFolderId}
                    closeModal={this._closeModal}
                    openCredential={id => {
                        this.refreshView(id)
                    }}
                />
                <FolderAdministrationModal
                    open={folderCreationModalOpen}
                    closeModal={this._closeModal}
                    onRequestRefresh={this.refreshView}
                    parent={openFolderId}
                    forCreation
                />
            </div>
        )
    }
}

const mapStateToProps = () => ({
})

const mapDispatchToProps = {
    removeSearchAction,
    replaceSearchAction,
    requestFolderContents,
    requestFolderInfo,
    requestFolderPath
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(withSnackbar(FolderPage))))