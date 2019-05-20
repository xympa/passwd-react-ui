/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CircularProgress, Dialog, DialogContent, DialogTitle, DialogActions, Button, Zoom, Fade, List, Typography, Input, FormControl, Grow, FormHelperText, InputLabel } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles'
import { withSnackbar } from 'notistack'
import Validator from 'validator'
import { Translate, withLocalize } from 'react-localize-redux'
import classNames from 'classnames'
import { withRouter } from 'react-router-dom'
import ModalHeader from './Header'
import PermissionListItem from './PermissionListItem'
import AutoComplete from '../MaterialAutocomplete'
import localization from './localization.json'
import { requestFolderCreation, requestFolderDeletion, requestFolderUpdate, requestFolderInfo } from '../../actions/FolderActions';
import { requestCredentialInsertion } from '../../actions/CredentialActions';
import { requestUserList } from '../../actions/UserActions';

const INITIAL_STATE = {
    isEditing: false,
    isFetching: true,
    fields: {

    },
    userList: []
}

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
        folderId: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        parent: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        history: PropTypes.object.isRequired,
        forCreation: PropTypes.bool,
        open: PropTypes.bool.isRequired,
        enqueueSnackbar: PropTypes.func.isRequired,
        requestFolderCreation: PropTypes.func.isRequired,
        requestFolderDeletion: PropTypes.func.isRequired,
        requestFolderInfo: PropTypes.func.isRequired,
        requestFolderUpdate: PropTypes.func.isRequired,
        requestUserList: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        translate: PropTypes.func.isRequired,
        addTranslation: PropTypes.func.isRequired,
        closeModal: PropTypes.func.isRequired,
        onRequestRefresh: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            ...INITIAL_STATE,
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
        this._handleFolderLoad = this._handleFolderLoad.bind(this)

        const { addTranslation } = this.props
        addTranslation(localization)
    }

    componentDidMount() {
        this._handleFolderLoad()
    }


    componentDidUpdate(prevProps) {
        const { open } = this.props

        if (prevProps.open !== open) {
            this._handleFolderLoad()
        }
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

    _handleFolderLoad() {
        const { requestFolderInfo, open, folderId, requestUserList, parent } = this.props

        if (open && folderId)
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ isFetching: true }, () => {
                Promise.all([requestFolderInfo(folderId), requestUserList()])
                    .then(([folder, userList]) => {
                        this.setState({
                            folder,
                            userList,
                            fields: {
                                name: this._handleChange('name', folder.folderInfo.name)()
                            },
                            formPermissions: folder.permissions,
                            isFetching: false,
                        })
                    })
                    .catch(error => {
                        this.setState({ isFetching: false })
                    })
            })
        else if (open)
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ isFetching: true }, () => {
                Promise.all([requestFolderInfo(parent), requestUserList()])
                    .then(([folder, userList]) => {
                        this.setState({
                            userList,
                            fields: {
                                name: this._handleChange('name', '')()
                            },
                            formPermissions: folder.permissions,
                            isFetching: false,
                            isEditing: true
                        })
                    })
                    .catch(error => {
                        this.setState({ isFetching: false })
                    })
            })
        else
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                ...INITIAL_STATE,
                fields: {
                    name: this._handleChange('name', '')()
                },
            })
    }

    attemptDelete() {
        const { requestFolderDeletion, enqueueSnackbar, folderId, onRequestRefresh, translate } = this.props;
        requestFolderDeletion(folderId)
            .then(() => {
                enqueueSnackbar(translate("folderDeleted"), {
                    variant: "success"
                })
                onRequestRefresh()
            })
            .catch((error) => {
                enqueueSnackbar(error.message, {
                    variant: "error"
                })
            })
            .then(() => {
                this.setState({
                    isFetching: false
                })
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
        const { requestFolderUpdate, enqueueSnackbar, translate, folderId, onRequestRefresh } = this.props;
        const { fields, folder } = this.state;

        const valid = Object.keys(fields).filter(field => !fields[field].valid).length === 0

        if (valid)
            requestFolderUpdate({
                name: fields.name.sanitizedValue,
                id: folderId,
                parent: folder.folderInfo.parent
            }, this._parsePermissions())
                .then(() => {
                    onRequestRefresh()
                    enqueueSnackbar(translate("folderUpdated"), {
                        variant: "success"
                    })
                })
                .catch((error) => {
                    enqueueSnackbar(error.message, {
                        variant: "error"
                    })

                })
                .then(() => {
                    this.setState({
                        isFetching: false
                    })
                })
        else {
            enqueueSnackbar(translate("badForm"), {
                variant: "error"
            })
        }
    }

    submitFormForInsert() {
        const { requestFolderCreation, enqueueSnackbar, translate, parent, history } = this.props;
        const { fields } = this.state;

        const valid = Object.keys(fields).filter(field => !fields[field].valid).length === 0

        if (valid)
            requestFolderCreation({
                name: fields.name.sanitizedValue,
                parent,
            }, this._parsePermissions())
                .then(newFolderId => {
                    enqueueSnackbar(translate("folderCreated"), {
                        variant: "success"
                    })
                    history.push('/home/' + newFolderId)
                })
                .catch((error) => {
                    enqueueSnackbar(error.message, {
                        variant: "error"
                    })
                })
                .then(() => {
                    this.setState({
                        isFetching: false
                    })
                })
        else {
            enqueueSnackbar(translate("badForm"), {
                variant: "error"
            })
        }
    } title

    addPermission(perm) {
        const { openId } = this.props;
        this.setState(prevState => ({
            formPermissions: [...prevState.formPermissions, { userId: perm.value, hasAdmin: 0, folderId: openId }]
        }))
    }

    render() {
        const { formPermissions, fields, isFetching, isEditing, userList } = this.state;
        const { forCreation, classes, translate, open, closeModal } = this.props;

        return (
            <StyledDialog open={open} maxWidth="md" TransitionComponent={Zoom} fullWidth style={{ overflow: "visible" }} disableRestoreFocus onBackdropClick={closeModal} onEscapeKeyDown={closeModal}>
                <DialogTitle>
                    {!isFetching && (
                        <ModalHeader
                            closeAdmin={closeModal}
                            isEditing={isEditing}
                            toggleEditMode={() => {
                                this.setState(prevState => ({ isEditing: !prevState.isEditing }))
                            }}
                            isCreating={forCreation ? true : false}
                        />
                    )}
                </DialogTitle>
                <DialogContent style={{ overflow: "visible" }}>
                    {isFetching && <CircularProgress />}
                    <div style={isFetching ? { display: "none" } : { display: "flex", flexDirection: "column" }}>
                        <FormControl error={!fields.name.valid} disabled={!isEditing} className={classNames(classes.margin, classes.textField)}>
                            <InputLabel htmlFor="name"><Translate id="name" /></InputLabel>
                            <Input
                                id="name"
                                type='text'
                                value={fields.name.value}
                                onChange={this._handleChange('name')}
                            />
                            <Grow in={!fields.name.valid}>
                                <FormHelperText><Translate id="nameMandatory" /></FormHelperText>
                            </Grow>
                        </FormControl>
                        <AutoComplete
                            suggestions={userList
                                .filter(user => !formPermissions.map(perm => perm.userId).includes(user.username))
                                .map(user => ({ value: user.username, label: user.username }))
                            }
                            onSuggestionAccepted={this.addPermission}
                            disabled={!isEditing}
                            placeholder={translate("username")}
                        />
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
                                    />
                                )) ||
                                (
                                    <Typography><Translate id="noPermissions" /></Typography>
                                )
                            }
                        </List>
                    </div>
                </DialogContent>
                {!forCreation ? (
                    <Fade in={isEditing}>
                        <DialogActions>
                            <Button variant="contained" onClick={this.attemptDelete} disabled={!isEditing}>
                                <Translate id="delete" />
                            </Button>
                            <div style={{ flex: 1 }} />
                            <Button variant="contained" style={{ justifySelf: "flex-start" }} onClick={this.submitFormForUpdate} color="secondary" disabled={!isEditing}>
                                <Translate id="save" />
                            </Button>
                        </DialogActions>
                    </Fade>
                ) : (
                        <Fade in={!isFetching}>
                            <DialogActions>
                                <Button variant="contained" onClick={this.submitFormForInsert} disabled={isFetching}>
                                    <Translate id="create" />
                                </Button>
                            </DialogActions>
                        </Fade>
                    )}
            </StyledDialog>
        )
    }
}

const mapStateToProps = (state) => ({
    // folder: state.folderAdmin.data && state.folderAdmin.data.folderInfo,
    // permissions: state.folderAdmin.data && state.folderAdmin.data.permissions,
    // users: state.folderAdmin.userList,
    // openId: state.folderAdmin.openFolder,
    // isFetching: state.folderAdmin.isFetching,
    // isEditing: state.folderAdmin.isEditing || state.folderAdmin.isCreating,
    // isCreating: state.folderAdmin.isCreating
})

const mapDispatchToProps = {
    requestFolderCreation,
    requestCredentialInsertion,
    requestFolderDeletion,
    requestFolderUpdate,
    requestFolderInfo,
    requestUserList
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(withLocalize(withRouter(FolderAdministrationModal)))))
