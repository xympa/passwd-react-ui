import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import Validator from 'validator'
import classNames from 'classnames'

import {
    CircularProgress, Dialog, DialogContent, DialogTitle, DialogActions,
    Button, Zoom, Fade, FormControl, Input, FormControlLabel, InputLabel, Grow,
    FormHelperText, Switch,
} from '@material-ui/core'
import { requestUser, requestUserCreation, requestUserEdit, requestUserRemoval, fetchUserList } from '../../actions/UserActions'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import ModalHeader from './Header'
import { withSnackbar } from 'notistack';

const INITIAL_STATE = {
    isEditing: false,
    isShowing: false,
    user: null,
    isFetching: true,
    form: {
        email: {
            value: '',
            sanitizedValue: '',
            valid: false
        },
        username: {
            value: '',
            sanitizedValue: '',
            valid: false
        },
        password: {
            value: '',
            sanitizedValue: '',
            valid: false
        },
        ldap: true,
        sysadmin: false
    }
}

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit,
        flex: 0
    }
})

class UserAdminModal extends Component {

    static propTypes = {
        forCreation: PropTypes.bool,
        username: PropTypes.string.isRequired,
        requestUser: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired,
        onRequestClose: PropTypes.func.isRequired,
        requestUserCreation: PropTypes.func.isRequired,
        requestUserEdit: PropTypes.func.isRequired,
        requestUserRemoval: PropTypes.func.isRequired,
    }

    static defaultProps = {
        forCreation: false
    }

    constructor(props) {
        super(props)

        this.state = INITIAL_STATE

        this.submitFormForInsert = this.submitFormForInsert.bind(this)
        this.submitFormForUpdate = this.submitFormForUpdate.bind(this)
        this.attemptDelete = this.attemptDelete.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        const { requestUser, username, open } = this.props

        if (prevProps.open !== open) {
            if (open && username)
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({ isFetching: true }, () => {
                    requestUser(username)
                        .then(({ data }) => {
                            console.log(data)
                            this.setState({
                                user: data,
                                isFetching: false,
                                form: {
                                    ...this._formFromUser(data),
                                    ldap: data.ldap == "1",
                                    sysadmin: data.sysadmin == "1"
                                }
                            })
                        })
                })
            else if (open)
                this.setState({
                    isEditing: true,
                    isFetching: false
                })
            else
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState(INITIAL_STATE)
        }
    }

    _handleChange = (name, rawValue) => event => {
        const { forCreation } = this.props
        let value;

        if (event)
            value = event.target.value;
        else
            value = rawValue;

        const sanitizedValue = value.trim();

        let valid;

        switch (name) {
            case 'email':
                valid = Validator.isEmail(sanitizedValue) && !Validator.isEmpty(sanitizedValue)
                break;
            case 'username':
                valid = !Validator.isEmpty(sanitizedValue);
                break;
            case 'password':
                valid = !forCreation || !Validator.isEmpty(sanitizedValue)
                break;
            default:
                valid = false;
        }

        if (event)
            this.setState(prevState => ({
                ...prevState,
                form: {
                    ...prevState.form,
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

    _formFromUser(user) {
        return {
            username: this._handleChange('username', user.username)(),
            email: this._handleChange('email', user.email)(),
            password: this._handleChange('password', '')(),
        }
    }

    submitFormForUpdate() {
        const { requestUserEdit, enqueueSnackbar } = this.props;
        const { form } = this.state;

        const valid = Object.keys(form).filter(field => typeof form[field] === 'object' && !form[field].valid).length === 0

        if (valid)
            this.setState({
                isFetching: false
            }, () => {

                requestUserEdit({
                    username: form.username.sanitizedValue,
                    password: form.password.sanitizedValue,
                    email: form.email.sanitizedValue,
                    ldap: form.ldap,
                    sysadmin: form.sysadmin,
                })
                    .then(() => {
                        this.setState({
                            isEditing: false
                        })
                        enqueueSnackbar("Utilizador editado com sucesso", {
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
            })
        else {
            enqueueSnackbar('Some fields look invalid please check the form again', {
                variant: "error"
            })
        }
    }

    submitFormForInsert() {
        const { requestUserCreation, enqueueSnackbar, onRequestClose, fetchUserList } = this.props;
        const { form } = this.state;

        const valid = Object.keys(form).filter(field => typeof form[field] === 'object' && !form[field].valid).length === 0

        if (valid)
            this.setState({
                isFetching: true
            }, () => {
                requestUserCreation({
                    username: form.username.sanitizedValue,
                    password: form.password.sanitizedValue,
                    email: form.email.sanitizedValue,
                    ldap: form.ldap,
                    sysadmin: form.sysadmin,
                })
                    .then(() => {
                        fetchUserList()
                        onRequestClose()
                    })
                    .catch((error) => {
                        enqueueSnackbar(error.message, {
                            variant: "error"
                        })
                    })
            })
        else {
            enqueueSnackbar('Some fields look invalid please check the form again', {
                variant: "error"
            })
        }
    }


    attemptDelete() {
        const { requestUserRemoval, enqueueSnackbar, username, fetchUserList } = this.props;
        requestUserRemoval(username)
            .then(() => {
                fetchUserList()
                .then(() => {
                    const { onRequestClose } = this.props
                    onRequestClose()
                })
            })
            .catch((error) => {
                enqueueSnackbar(error.message, {
                    variant: "error"
                })
            })
    }

    render() {
        const { isFetching, isEditing, form } = this.state
        const { forCreation, open, onRequestClose, classes } = this.props

        return (
            <Dialog open={open} maxWidth="md" fullWidth TransitionComponent={Zoom} disableRestoreFocus disableBackdropClick onEscapeKeyDown={onRequestClose}>
                <DialogTitle>
                    {!isFetching && (
                        <ModalHeader
                            isEditing={isEditing}
                            isCreating={forCreation}
                            closeModal={onRequestClose}
                            toggleEditMode={() => { this.setState(prevState => ({ isEditing: !prevState.isEditing })) }}
                        />
                    )}
                </DialogTitle>
                <DialogContent>
                    {isFetching && <CircularProgress />}
                    <div style={isFetching ? { display: "none" } : { flexDirection: "column", display: "flex" }}>

                        <FormControl error={!form.username.valid} disabled={!forCreation} className={classNames(classes.margin, classes.textField)}>
                            <InputLabel htmlFor="username">Username</InputLabel>
                            <Input
                                id="username"
                                value={form.username.value}
                                type="username"
                                onChange={this._handleChange('username')}
                            />
                            <Grow in={!form.username.valid}>
                                <FormHelperText>Username is mandatory</FormHelperText>
                            </Grow>
                        </FormControl>
                        <FormControl error={!form.email.valid} disabled={!isEditing} className={classNames(classes.margin, classes.textField)}>
                            <InputLabel htmlFor="email">Email</InputLabel>
                            <Input
                                id="email"
                                value={form.email.value}
                                type="email"
                                onChange={this._handleChange('email')}
                            />
                            <Grow in={!form.email.valid}>
                                <FormHelperText>This is not recognized as a valid email</FormHelperText>
                            </Grow>
                        </FormControl>
                        <FormControl error={!form.password.valid} disabled={!isEditing} className={classNames(classes.margin, classes.textField)}>
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <Input
                                id="password"
                                value={form.password.value}
                                type="password"
                                onChange={this._handleChange('password')}
                            />
                            <Grow in={!form.password.valid}>
                                <FormHelperText>This password does not meet the security standards</FormHelperText>
                            </Grow>
                        </FormControl>
                        <div style={{ display: "flex" }}>
                            <FormControlLabel
                                disabled={!isEditing}
                                style={{ flex: 1 }}
                                control={(
                                    <Switch
                                        checked={form.ldap}
                                        onChange={() => {
                                            this.setState(prevState => ({
                                                form: {
                                                    ...prevState.form,
                                                    ldap: !prevState.form.ldap
                                                }
                                            }))
                                        }}
                                    />
                                )}
                                label="LDAP"
                            />
                            <FormControlLabel
                                style={{ flex: 1 }}
                                disabled={!isEditing}
                                control={(
                                    <Switch
                                        checked={form.sysadmin}
                                        onChange={() => {
                                            this.setState(prevState => ({
                                                form: {
                                                    ...prevState.form,
                                                    sysadmin: !prevState.form.sysadmin
                                                }
                                            }))
                                        }}
                                    />
                                )}
                                label="SysAdmin"
                            />
                        </div>
                    </div>
                </DialogContent>
                {!forCreation ? (
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
                    </Fade>
                ) : (
                        <Fade in>
                            <DialogActions>
                                <Button variant="contained" onClick={this.submitFormForInsert}>
                                    Create
                                </Button>
                            </DialogActions>
                        </Fade>
                    )}
            </Dialog>
        )
    }
}


const mapStateToProps = () => ({
})

const mapDispatchToProps = {
    requestUser,
    requestUserCreation,
    requestUserEdit,
    requestUserRemoval,
    removeSearchAction,
    fetchUserList,
    replaceSearchAction,
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(UserAdminModal)))