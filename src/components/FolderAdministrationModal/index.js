/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CircularProgress, Dialog, DialogContent, DialogTitle, DialogActions, Button, Zoom, Fade, List, Typography, Input, FormControl, Grow, FormHelperText, InputLabel } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles'
import { withSnackbar } from 'notistack'
import Validator from 'validator'
import classNames from 'classnames'
import ModalHeader from './Header'
import UserAutocomplete from './UserAutocomplete'
import PermissionListItem from './PermissionListItem'
import { updateFolder, createFolder, setFetching, deleteFolder } from '../../actions/FolderAdminActions'

const StyledDialog = withStyles(() => ({
    paper: {
        overflow: "visible"
    }
}))(Dialog);

const styles = theme => ({
    textField: {
        flex: 1,
    },
    margin: {
        marginBottom: theme.spacing.unit
    },
    root: {}
})

export class FolderAdministrationModal extends Component {
    static propTypes = {
        isFetching: PropTypes.bool.isRequired,
        openId: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        isEditing: PropTypes.bool.isRequired,
        updateFolder: PropTypes.func.isRequired,
        deleteFolder: PropTypes.func.isRequired,
        createFolder: PropTypes.func.isRequired,
        isCreating: PropTypes.bool.isRequired,
        enqueueSnackbar: PropTypes.func.isRequired,
        setFetching: PropTypes.func.isRequired,
        users: PropTypes.array.isRequired,
        permissions: PropTypes.array.isRequired,
        folder: PropTypes.object,
        classes: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            isShowing: false,
            formPermissions: [],
            fields: {
                name: this._handleChange('name', '')()
            },
        }

        this.addPermission = this.addPermission.bind(this)
        this.onPermissionRemoved = this.onPermissionRemoved.bind(this)
        this.onAdminChanged = this.onAdminChanged.bind(this)
        this.submitFormForUpdate = this.submitFormForUpdate.bind(this)
        this.submitFormForInsert = this.submitFormForInsert.bind(this)
        this.attemptDelete = this.attemptDelete.bind(this)
    }

    componentDidUpdate(prevProps) {
        const { openId, folder, isCreating, permissions } = this.props;

        if (openId !== prevProps.openId || isCreating !== prevProps.isCreating)
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ isShowing: openId !== null || isCreating });

        if (permissions !== prevProps.permissions)
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ formPermissions: permissions });

        if (folder !== prevProps.folder)
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ fields: { name: this._handleChange('name', (folder ? folder.name : ''))() } })
    }

    onAdminChanged(username, isAdmin) {
        this.setState(prevState => ({
            formPermissions: prevState.formPermissions.map(perm => {
                if (perm.userId === username)
                    perm.hasAdmin = isAdmin ? 1 : 0;
                return perm
            })
        }))
    }

    onPermissionRemoved(username) {
        this.setState(prevState => ({
            formPermissions: prevState.formPermissions.filter(perm => perm.userId !== username)
        }))
    }

    _handleChange = (name, rawValue) => event => {
        let value;

        if (event)
            value = event.target.value;
        else
            value = rawValue;

        const sanitizedValue = value.trim();

        let valid;

        switch (name) {
            case 'name':
                valid = !Validator.isEmpty(sanitizedValue);
                break;
            default:
                valid = false;
        }

        if (event)
            this.setState(prevState => ({
                ...prevState,
                fields: {
                    ...prevState.fields,
                    [name]: {
                        sanitizedValue: sanitizedValue,
                        value: value,
                        valid: valid
                    },
                }
            }));

        return {
            sanitizedValue: sanitizedValue,
            value: value,
            valid: valid
        };
    }

    attemptDelete() {
        const { deleteFolder, enqueueSnackbar, setFetching } = this.props;
        deleteFolder()
            .catch((error) => {
                enqueueSnackbar(error.message, {
                    variant: "error"
                })
                setFetching(false)
            })
    }

    _parsePermissions() {
        const { formPermissions } = this.state;
        let parsedPermissions = {};
        formPermissions.forEach(perm => {
            parsedPermissions[perm.userId] = perm.hasAdmin ? "1" : "0";
        });
        return parsedPermissions;
    }

    submitFormForUpdate() {
        const { updateFolder, enqueueSnackbar, setFetching } = this.props;
        const { fields } = this.state;

        const valid = Object.keys(fields).filter(field => !fields[field].valid).length === 0

        if (valid)
            updateFolder({
                name: fields.name.sanitizedValue
            }, this._parsePermissions())
                .catch((error) => {
                    enqueueSnackbar(error.message, {
                        variant: "error"
                    })
                    setFetching(false)

                })
        else {
            enqueueSnackbar('Some fields look invalid please check the form again', {
                variant: "error"
            })
        }
    }

    submitFormForInsert() {
        const { createFolder, enqueueSnackbar, setFetching } = this.props;
        const { fields } = this.state;

        const valid = Object.keys(fields).filter(field => !fields[field].valid).length === 0

        if (valid)
            createFolder({
                name: fields.name.sanitizedValue
            }, this._parsePermissions())
                .catch((error) => {
                    enqueueSnackbar(error.message, {
                        variant: "error"
                    })
                    setFetching(false)
                })
        else {
            enqueueSnackbar('Some fields look invalid please check the form again', {
                variant: "error"
            })
        }
    }

    addPermission(username) {
        const { openId } = this.props;
        this.setState(prevState => ({
            formPermissions: [...prevState.formPermissions, { userId: username, hasAdmin: 0, folderId: openId }]
        }))
    }

    render() {
        const { isShowing, formPermissions, fields } = this.state;
        const { isFetching, isEditing, isCreating, users, classes } = this.props;

        return (
            <StyledDialog open={isShowing} maxWidth="md" TransitionComponent={Zoom} fullWidth style={{ overflow: "visible" }}>
                <DialogTitle>
                    {!isFetching && <ModalHeader />}
                </DialogTitle>
                <DialogContent style={{ overflow: "visible" }}>
                    {isFetching && <CircularProgress />}
                    <div style={isFetching ? { display: "none" } : { display: "flex", flexDirection: "column" }}>
                        <FormControl error={!fields.name.valid} disabled={!isEditing} className={classNames(classes.margin, classes.textField)}>
                            <InputLabel htmlFor="title">Name</InputLabel>
                            <Input
                                id="name"
                                type='text'
                                value={fields.name.value}
                                onChange={this._handleChange('name')}
                            />
                            <Grow in={!fields.name.valid}>
                                <FormHelperText>The name is mandatory</FormHelperText>
                            </Grow>
                        </FormControl>
                        {/*permissions && users &&*/ (
                            <UserAutocomplete
                                suggestions={users
                                    .filter(user => !formPermissions.map(perm => perm.userId).includes(user.username))
                                    .map(user => ({ value: user.username, label: user.username }))
                                }
                                onAutocomplete={this.addPermission}
                            />
                        )}
                        <List>
                            {formPermissions && formPermissions.length > 0 &&
                                formPermissions.map(perm => (
                                    <PermissionListItem
                                        key={perm.userId}
                                        hasAdmin={perm.hasAdmin}
                                        userId={perm.userId}
                                        isEditing={isEditing}
                                        adminChanged={this.onAdminChanged}
                                        permissionRemoved={this.onPermissionRemoved}
                                    />)) ||
                                (<Typography>Não existem permissões para esta pasta</Typography>)
                            }
                        </List>
                    </div>
                </DialogContent>
                {!isCreating ? (
                    <Fade in={isEditing}>
                        <DialogActions>
                            <Button variant="contained" onClick={this.attemptDelete}>
                                Delete
                            </Button>
                            <div style={{ flex: 1 }} />
                            <Button variant="contained" style={{ justifySelf: "flex-start" }} onClick={this.submitFormForUpdate} color="secondary">
                                Save
                            </Button>
                        </DialogActions>
                    </Fade>) : (
                        <Fade in>
                            <DialogActions>
                                <Button variant="contained" onClick={this.submitFormForInsert}>
                                    Create
                                </Button>
                            </DialogActions>
                        </Fade>
                    )}
            </StyledDialog>
        )
    }
}

const mapStateToProps = (state) => ({
    folder: state.folderAdmin.data && state.folderAdmin.data.folderInfo,
    permissions: state.folderAdmin.data && state.folderAdmin.data.permissions,
    users: state.folderAdmin.userList,
    openId: state.folderAdmin.openFolder,
    isFetching: state.folderAdmin.isFetching,
    isEditing: state.folderAdmin.isEditing || state.folderAdmin.isCreating,
    isCreating: state.folderAdmin.isCreating
})

const mapDispatchToProps = {
    updateFolder,
    deleteFolder,
    createFolder,
    setFetching
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(FolderAdministrationModal)))
