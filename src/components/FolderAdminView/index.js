/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Zoom, Fab, Fade, Typography } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder'
import AddIcon from '@material-ui/icons/Add'
import { withStyles } from '@material-ui/core/styles'
import { List } from 'react-virtualized'
import { fetchAdministrationFolders } from '../../actions/FolderActions'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import FolderListItem from '../FolderListItem';
import { beginCreation as beginFolderCreation, adminFolder } from '../../actions/FolderAdminActions'
import { measureElement } from '../../Utils'

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
        fetchAdministrationFolders: PropTypes.func.isRequired,
        removeSearchAction: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        contents: PropTypes.arrayOf(PropTypes.object),
        isFetching: PropTypes.bool.isRequired,
        beginFolderCreation: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            width: window.innerWidth, height: window.innerHeight,
        }

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this.refreshView = this.refreshView.bind(this)
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

    refreshView(resolve, reject) {
        const { fetchAdministrationFolders } = this.props;
        fetchAdministrationFolders()
            .then(resolve)
            .catch(reject)
    }

    render() {
        const { contents, isFetching, beginFolderCreation, classes, adminFolder } = this.props;
        const { width, height } = this.state;

        return (
            <div>
                <div style={{ flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <Fade in={!isFetching}>
                        <List
                            rowCount={contents.length}
                            rowHeight={96}
                            height={height - 64}
                            width={width}
                            style={{ outline: 'none' }}
                            noRowsRenderer={() => (
                                <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexGrow: "1 1 1" }}>
                                    <Typography variant="h5" align="center">Use the button on the bottom right to create your first folder! Good Luck!</Typography>
                                </div>
                            )}
                            rowRenderer={({ index, style }) => {
                                const content = contents[index];
                                return (
                                    <FolderListItem
                                        style={{ paddingLeft: 64, paddingRight: 96, ...style }}
                                        key={"folder-" + content.idFolders}
                                        folder={content}
                                        onClick={() => { adminFolder(content.idFolders) }}
                                    />
                                )

                            }}
                        />
                    </Fade>
                </div>
                <Zoom in={!isFetching}>
                    <Fab color="secondary" className={classes.fab} onClick={() => { beginFolderCreation() }}><AddIcon /></Fab>
                </Zoom>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    contents: state.folder.contents.folders,
    isFetching: state.folder.isFetching,
})

const mapDispatchToProps = {
    removeSearchAction,
    replaceSearchAction,
    fetchAdministrationFolders,
    beginFolderCreation,
    adminFolder
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FolderAdminView))
