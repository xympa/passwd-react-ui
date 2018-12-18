/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IconButton, Zoom, Fab, Fade } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home'
import UpArrowIcon from '@material-ui/icons/ArrowUpward'
import SettingsIcon from '@material-ui/icons/Settings'
import AddIcon from '@material-ui/icons/Add'
import { withStyles } from '@material-ui/core/styles'
import { List } from 'react-virtualized';
import { openFolder, fetchFolderContents, goToParent, updateContents } from '../../actions/FolderActions'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import FolderListItem from '../FolderListItem';
import CredentialListItem from '../CredentialListItem'
import FolderBreadcrumbs from '../FolderBreadcrumbs'
import { openCredential, beginCredentialCreation } from '../../actions/CredentialActions'

const styles = theme => ({
    center: {
        justifyContent: "center",
        display: "flex",
        flex: 1
    },
    avatar: {
        marginLeft: 20,
        backgroundColor: theme.palette.secondary.main
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing.unit * 4,
        right: theme.spacing.unit * 4,
    },
});

export class FolderPage extends Component {
    static propTypes = {
        openFolder: PropTypes.func,
        replaceSearchAction: PropTypes.func.isRequired,
        updateContents: PropTypes.func.isRequired,
        removeSearchAction: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        contents: PropTypes.arrayOf(PropTypes.object),
        goToParent: PropTypes.func.isRequired,
        isFetching: PropTypes.bool.isRequired,
        openFolderId: PropTypes.any,
        beginCredentialCreation: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            width: window.innerWidth, height: window.innerHeight,
        }

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this._upButtonHandle = this._upButtonHandle.bind(this)
        this._homeButtonHandle = this._homeButtonHandle.bind(this)
    }

    componentDidMount() {
        const { replaceSearchAction, updateContents, openFolder } = this.props;

        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        replaceSearchAction(updateContents);
        openFolder(null);
    }

    componentWillUnmount() {
        const { removeSearchAction } = this.props;
        removeSearchAction();
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    _homeButtonHandle() {
        const { openFolder } = this.props;
        openFolder(null)
    }

    _upButtonHandle() {
        const { goToParent } = this.props;
        goToParent()
    }

    render() {


        const { classes, contents, isFetching , openFolderId, beginCredentialCreation} = this.props;
        const { width, height } = this.state;

        console.log(contents)


        return (
            <div>
                <div style={{ flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", height: 64, paddingLeft: 64, paddingRight: 64, borderBottom: "1px solid #e0e0e0" }}>
                        <IconButton disabled={openFolderId === null} color="secondary" style={{ flex: 0 }} onClick={this._homeButtonHandle}>
                            <HomeIcon style={{ fontSize: "2rem" }} />
                        </IconButton>
                        <IconButton disabled={openFolderId === null} color="secondary" style={{ flex: 0 }} onClick={this._upButtonHandle}>
                            <UpArrowIcon style={{ fontSize: "2rem" }}  />
                        </IconButton>
                        <FolderBreadcrumbs />
                        <IconButton style={{ flex: 0 }}>
                            <SettingsIcon style={{ fontSize: "2rem" }} color="secondary" />
                        </IconButton>
                    </div>
                    <Fade in={!isFetching}>
                        <List
                            rowCount={contents.length}
                            rowHeight={96}
                            height={height - 138}
                            width={width}
                            rowRenderer={({ index, style }) => {
                                const content = contents[index];

                                if (content.idFolders)
                                    return (
                                        <FolderListItem
                                            style={{ paddingLeft: 64, paddingRight: 64, ...style }}
                                            key={"folder-" + content.idFolders}
                                            folder={content}
                                        />
                                    )
                                else
                                    return (
                                        <CredentialListItem
                                            style={{ paddingLeft: 64, paddingRight: 64, ...style }}
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
                    <Fab className={classes.fab} color="primary" onClick={() => {beginCredentialCreation()}}>
                        <AddIcon />
                    </Fab>
                </Zoom>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    contents: [...state.folder.contents.credentials, ...state.folder.contents.folders],
    openFolderId: state.folder.openId,
    isFetching: state.folder.isFetching,
    folderInfo: state.folder.info
})

const mapDispatchToProps = {
    openFolder,
    removeSearchAction,
    replaceSearchAction,
    fetchFolderContents,
    goToParent,
    updateContents,
    beginCredentialCreation
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FolderPage))
