/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Zoom, Fab, Fade, Typography, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add'
import { Translate, withLocalize } from 'react-localize-redux'
import { withSnackbar } from 'notistack'
import { withStyles } from '@material-ui/core/styles'
import { List } from 'react-virtualized'
import { requestRootFolders } from '../../actions/FolderActions'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import FolderListItem from '../FolderListItem';
import { measureElement } from '../../Utils'
import localization from './localization.json'
import FolderAdministrationModal from '../FolderAdministrationModal'

const INITIAL_STATE = {
    isFetching: true,
    rootFolders: [],
    folderCreationModalOpen: false
}

const styles = theme => ({
    fab: {
        position: 'absolute',
        bottom: theme.spacing.unit * 4,
        right: theme.spacing.unit * 4,
    },
});

export class FolderAdminView extends Component {
    static propTypes = {
        replaceSearchAction: PropTypes.func.isRequired,
        removeSearchAction: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        translate: PropTypes.func.isRequired,
        addTranslation: PropTypes.func.isRequired,
        requestRootFolders: PropTypes.func.isRequired,
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
        this.refreshView = this.refreshView.bind(this)
        this._closeModal = this._closeModal.bind(this)

        const { addTranslation } = this.props
        addTranslation(localization)
    }

    componentDidMount() {
        const { replaceSearchAction } = this.props;

        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        replaceSearchAction(this.refreshView);
        this.refreshView();
    }

    componentWillUnmount() {
        const { removeSearchAction } = this.props;
        removeSearchAction();
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: measureElement(this).width, height: window.innerHeight });
    }

    refreshView() {
        const { requestRootFolders, enqueueSnackbar } = this.props;
        return requestRootFolders()
            .then(rootFolders => {
                this.setState({
                    rootFolders,
                    openModals: rootFolders.map(f => ({ id: f.idFolders, open: false })),
                    folderCreationModalOpen: false,
                    isFetching: false
                })
            })
            .catch(error => {
                enqueueSnackbar(error.message, {
                    variant: "error"
                })
            })
    }

    _closeModal() {
        this.setState(prevState => ({
            folderCreationModalOpen: false,
            openModals: prevState.openModals
                .map(m => ({
                    ...m,
                    open: false
                }))
        }))
    }

    render() {
        const { classes, translate } = this.props;
        const { width, height, isFetching, rootFolders, folderCreationModalOpen, openModals } = this.state;

        return (
            <div>
                <div style={{ flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <Fade in={!isFetching}>
                        <List
                            rowCount={rootFolders.length}
                            rowHeight={96}
                            height={height - 64}
                            width={width}
                            style={{ outline: 'none' }}
                            noRowsRenderer={() => (
                                <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexGrow: "1 1 1" }}>
                                    <Typography variant="h5" align="center"><Translate id="folderIntroduction" /></Typography>
                                </div>
                            )}
                            rowRenderer={({ index, style }) => {
                                const content = rootFolders[index];
                                return (
                                    <FolderListItem
                                        style={{ paddingLeft: 64, paddingRight: 96, ...style }}
                                        key={"folder-" + content.idFolders}
                                        folder={content}
                                        folderModalOpen={openModals.find(m => m.id == content.idFolders).open}
                                        onClick={() => {
                                            this.setState({
                                                folderCreationModalOpen: false,
                                                openModals: openModals
                                                    .map(m => ({
                                                        ...m,
                                                        open: m.id == content.idFolders ? true : false
                                                    }))
                                            })
                                        }}
                                        closeModal={this._closeModal}
                                        onRequestRefresh={this.refreshView}
                                    />
                                )

                            }}
                        />
                    </Fade>
                </div>
                <Zoom in={!isFetching}>
                    <Tooltip title={translate("createFolder")}>
                        <Fab
                            color="primary"
                            className={classes.fab}
                            onClick={() => {
                                this.setState({
                                    folderCreationModalOpen: true,
                                    openModals: openModals
                                        .map(m => ({
                                            ...m,
                                            open: false
                                        }))
                                })
                            }}
                        >
                            <AddIcon />
                        </Fab>
                    </Tooltip>
                </Zoom>
                <FolderAdministrationModal
                    open={folderCreationModalOpen}
                    closeModal={this._closeModal}
                    onRequestRefresh={this.refreshView}
                    parent={null}
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
    requestRootFolders
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(withSnackbar(FolderAdminView))))
