import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import {
    Dialog, DialogTitle, Typography, CircularProgress, FormControl, FormHelperText, Input, InputLabel,
    Grow, IconButton, Tooltip
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import Validator from 'validator'
import Button from '@material-ui/core/Button';
import { withSnackbar } from 'notistack';
import { withLocalize, Translate } from 'react-localize-redux'
import localization from './localization.json'
import { requestUser, requestUserEdit } from '../../actions/UserActions'

const INITIAL_STATE = {
    form: {

    },
    isFetching: true
}

const styles = theme => ({
    textField: {
        margin: theme.spacing.unit
    },
    editButton: {
        marginTop: theme.spacing.unit * 5,
        backgroundColor: theme.palette.secondary.main,
        // backgroundColor: theme.palette.secondary.main,
        color: "white",
    },
    root: {
        padding: theme.spacing.unit * 2
    },
    avatar: {
        marginTop: 50,
        height: 96,
        width: 96,
        backgroundColor: theme.palette.secondary.main
        // backgroundColor: theme.palette.primary.main,

    },
})

class EditSelfModal extends Component {
    static propTypes = {
        addTranslation: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        translate: PropTypes.func.isRequired,
        enqueueSnackbar: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired,
        onRequestClose: PropTypes.func.isRequired,
        username: PropTypes.string.isRequired,
        requestUser: PropTypes.func.isRequired,
        requestUserEdit: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            ...INITIAL_STATE
        }

        props.addTranslation(localization)

        this.submitFormForUpdate = this.submitFormForUpdate.bind(this)
    }


    componentDidUpdate(prevProps, prevState) {
        const { requestUser, username, open } = this.props

        if (prevProps.open !== open) {
            if (open)
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({ isFetching: true }, () => {
                    requestUser(username)
                        .then(({ data }) => {
                            this.setState({
                                user: data,
                                isFetching: false,
                                form: {
                                    ...this._formFromUser(data)
                                }
                            })
                        })
                })
            else
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState(INITIAL_STATE)
        }
    }

    _handleChange = (name, rawValue) => event => {
        let value;

        if (event)
            value = event.target.value;
        else
            value = rawValue;

        const sanitizedValue = value.trim();
        const { form } = this.state

        let valid;

        switch (name) {
            case 'email':
                valid = Validator.isEmail(sanitizedValue) && !Validator.isEmpty(sanitizedValue)
                break;
            case 'confirmPassword':
                valid = !(form.password) || sanitizedValue === form.password.sanitizedValue
                break;
            case 'password':
                valid = true
                break;
            default:
                valid = false;
        }

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
        }), () => {
            if (name === "password" && form.confirmPassword) // changing password requires revalidation of confirmPassword
            {
                const { form } = this.state // pull updated state
                this._handleChange('confirmPassword', form.confirmPassword.sanitizedValue)()
            }
        });

        return {
            sanitizedValue: sanitizedValue,
            value: value,
            valid: valid
        };
    }

    _formFromUser(user) {
        return {
            email: this._handleChange('email', user.email)(),
            password: this._handleChange('password', '')(),
            confirmPassword: this._handleChange('confirmPassword', '')(),
        }
    }

    submitFormForUpdate() {
        const { requestUserEdit, enqueueSnackbar, onRequestClose, username, translate } = this.props;
        const { form } = this.state;

        const valid = Object.keys(form).filter(field => typeof form[field] === 'object' && !form[field].valid).length === 0

        if (valid)
            this.setState({
                isFetching: false
            }, () => {

                requestUserEdit({
                    username: username,
                    password: form.password.sanitizedValue,
                    email: form.email.sanitizedValue,
                    ldap: null,
                    sysadmin: null,
                })
                    .then(() => {
                        onRequestClose()
                        enqueueSnackbar(translate("infoUpdated"), {
                            variant: "success"
                        })
                    })
                    .catch((error) => {
                        enqueueSnackbar(error.message, {
                            variant: "error"
                        })
                    })
            })
        else {
            enqueueSnackbar(translate("badForm"), {
                variant: "error"
            })
        }
    }

    render() {
        const { classes, open, onRequestClose, translate } = this.props
        const { form, isFetching } = this.state

        return (
            <Dialog maxWidth="md" fullWidth open={open} classes={{ paper: classes.root }} onEscapeKeyDown={onRequestClose} onBackdropClick={onRequestClose}>
                {isFetching ? <CircularProgress /> : [
                    <DialogTitle key="title">
                        <div style={{ display: "flex" }}>
                            <Typography><Translate id="myAccount" /></Typography>
                            <div style={{ flex: 1 }} />
                            <Tooltip title={translate("closeModal")}>
                                <IconButton aria-label="Delete" className={classes.margin} onClick={onRequestClose}>
                                    <CloseIcon color="secondary" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </DialogTitle>,
                    <div style={{ flexDirection: "column", display: "flex", flex: 1 }} key="content">
                        <FormControl error={!form.email.valid} fullWidth className={classNames(classes.margin, classes.textField)}>
                            <InputLabel htmlFor="email"><Translate id="email" /></InputLabel>
                            <Input
                                id="email"
                                value={form.email.value}
                                type="email"
                                onChange={this._handleChange('email')}
                            />
                            <Grow in={!form.email.valid}>
                                <FormHelperText><Translate id="badEmail" /></FormHelperText>
                            </Grow>
                        </FormControl>
                        <FormControl error={!form.password.valid} className={classNames(classes.margin, classes.textField)}>
                            <InputLabel htmlFor="password"><Translate id="password" /></InputLabel>
                            <Input
                                id="password"
                                value={form.password.value}
                                type="password"
                                onChange={this._handleChange('password')}
                            />
                            <Grow in={!form.password.valid}>
                                <FormHelperText><Translate id="badPassword" /></FormHelperText>
                            </Grow>
                        </FormControl>
                        <FormControl error={!form.confirmPassword.valid} className={classNames(classes.margin, classes.textField)}>
                            <InputLabel htmlFor="confirm-password"><Translate id="confirmPassword" /></InputLabel>
                            <Input
                                id="confirm-password"
                                value={form.confirmPassword.value}
                                type="password"
                                onChange={this._handleChange('confirmPassword')}
                            />
                            <Grow in={!form.confirmPassword.valid}>
                                <FormHelperText><Translate id="badConfirm" /></FormHelperText>
                            </Grow>
                        </FormControl>
                        <div style={{ display: "flex" }}>
                            <div style={{ flex: 1 }} />
                            <Button variant="contained" className={classes.editButton} onClick={this.submitFormForUpdate}>
                                <Translate id="save" />
                            </Button>
                        </div>
                    </div>
                ]}
            </Dialog>
        )
    }
}

const mapStateToProps = (state) => ({
    username: state.authentication.username
})

const mapDispatchToProps = {
    requestUser,
    requestUserEdit
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(withLocalize(EditSelfModal))))
