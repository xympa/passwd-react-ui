/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Validator from 'validator'
import { connect } from 'react-redux'
import {
    CircularProgress, Dialog, DialogContent, DialogTitle, DialogActions,
    Button, Zoom, Fade, FormControl, Input, FormControlLabel, InputLabel, Grow,
    FormHelperText, Checkbox, TextField, Select, MenuItem, Typography, Radio,
    Slide
} from '@material-ui/core'
import Tree from 'react-animated-tree'
import { withStyles } from '@material-ui/core/styles'
import { withSnackbar } from 'notistack';
import { withLocalize, Translate } from 'react-localize-redux'
import localization from './localization.json'
import CredentialForm from '../CredentialModal/Form'
import ModalHeader from './Header'
import UserAutoComplete from '../MaterialAutocomplete'
import { sendMessage, setFetching, getFrontServerPath, moveToCredentialLocationStep, saveCredential, deleteMessage, closeModal } from '../../actions/MessageActions'

const timeToDieOptions = [
    {
        value: '+6 hours',
        label: '6 hours'
    },
    {
        value: '+12 hours',
        label: '12 hours'
    },
    {
        value: '+24 hours',
        label: '24 hours'
    },
    {
        value: '+7 days',
        label: '7 days'
    },
]

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit
    },
    textField: {
        flex: "1 1 100%",
        alignSelf: "stretch"
    },
    leftMargin: {
        marginLeft: theme.spacing.unit
    },
    timeToDieRoot: {
        // flex: "0 1 40%"
        flex: 1,
    },
    isExternalRoot: {
        // flex: "0 1 33%"
        flex: 1,
    },
    unsetDimensions: {
        padding: 0
    }
})

export class MessageModal extends Component {
    static propTypes = {
        isFetching: PropTypes.bool.isRequired,
        enqueueSnackbar: PropTypes.func.isRequired,
        isOpen: PropTypes.bool.isRequired,
        credential: PropTypes.object,
        isCreating: PropTypes.bool.isRequired,
        isEditing: PropTypes.bool.isRequired,
        users: PropTypes.array,
        sendMessage: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        setFetching: PropTypes.func.isRequired,
        sendResult: PropTypes.object,
        folderTree: PropTypes.array,
        choosingCredentialLocation: PropTypes.bool.isRequired,
        messageInfo: PropTypes.object,
        saveCredential: PropTypes.func.isRequired,
        moveToCredentialLocationStep: PropTypes.func.isRequired,
        readonly: PropTypes.bool,
        addTranslation: PropTypes.func.isRequired,
        translate: PropTypes.func.isRequired,
        deleteMessage: PropTypes.func.isRequired,
        closeModal: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            credentialForm: {},
            isExternal: false,
            targetFolder: null,
            fields: {
                receiver: {
                    value: '',
                    sanitizedValue: '',
                    valid: true
                },
                message: {
                    value: '',
                    sanitizedValue: '',
                    valid: true
                }
            },
            timeToDie: '+6 hours'
        }

        this.sendMessage = this.sendMessage.bind(this)
        this.attemptDelete = this.attemptDelete.bind(this)

        const { addTranslation } = this.props
        addTranslation(localization)
    }

    componentDidUpdate(prevProps) {
        const { open, isEditing, messageInfo } = this.props;

        if (open && !prevProps.open)
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ credentialForm: {} })

        if ((prevProps.isEditing && !isEditing) || prevProps.messageInfo !== messageInfo)
            this.updateFormToMatchStore()
    }



    _fieldsFromMessage = message => {
        if (message == null)
            message = {
                message: "",
                receiverId: ""
            }

        return {
            message: this._handleChange('message', message.message)(),
            receiver: this._handleChange('receiver', message.receiverId)(),
        }
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
            case 'receiver':
                valid = Validator.isEmail(sanitizedValue) || Validator.isEmpty(sanitizedValue)
                break;
            case 'message':
                valid = true;
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

    updateFormToMatchStore() {
        const { messageInfo } = this.props;
        const newFields = this._fieldsFromMessage(messageInfo)
        this.setState({ fields: newFields });
    }

    saveMessageCredential() {
        const { enqueueSnackbar, saveCredential, setFetching, messageInfo, translate } = this.props;
        const { credentialForm, targetFolder } = this.state;

        const valid = Object.keys(credentialForm).filter(field => !credentialForm[field].valid).length === 0

        if (valid)
            saveCredential(
                messageInfo.idMessages,
                {
                    description: credentialForm.description.sanitizedValue,
                    username: credentialForm.username.sanitizedValue,
                    title: credentialForm.title.sanitizedValue,
                    password: credentialForm.password.sanitizedValue,
                    url: credentialForm.url.sanitizedValue,
                },
                targetFolder
            )
                .then(() => {
                    enqueueSnackbar(translate("messageSaved"), {
                        variant: "success"
                    })
                })
                .catch((error) => {
                    enqueueSnackbar(error.message, {
                        variant: "error"
                    })
                    setFetching(false)
                })
        else {
            enqueueSnackbar(translate("badForm"), {
                variant: "error"
            })
        }
    }

    sendMessage() {
        const { enqueueSnackbar, sendMessage, credential, setFetching, translate } = this.props;
        const { fields, credentialForm, isExternal, timeToDie } = this.state;

        const valid = Object.keys(fields).filter(field => !fields[field].valid).length === 0 ||
            Object.keys(credentialForm).filter(field => !credentialForm[field].valid).length === 0

        if (valid)
            sendMessage(
                credential ? credential.idCredentials : {
                    description: credentialForm.description.sanitizedValue,
                    username: credentialForm.username.sanitizedValue,
                    title: credentialForm.title.sanitizedValue,
                    password: credentialForm.password.sanitizedValue,
                    url: credentialForm.url.sanitizedValue,
                },
                {
                    message: fields.message.sanitizedValue,
                    receiver: {
                        isExternal,
                        target: fields.receiver.sanitizedValue
                    },
                    timeToDie
                })
                .then(() => {
                    enqueueSnackbar(translate("messageSent"), {
                        variant: "success"
                    })
                })
                .catch((error) => {
                    enqueueSnackbar(error.message, {
                        variant: "error"
                    })
                    setFetching(false)
                })
        else {
            enqueueSnackbar(translate("badForm"), {
                variant: "error"
            })
        }
    }

    attemptDelete() {
        const { enqueueSnackbar, deleteMessage, messageInfo, translate } = this.props;

        deleteMessage(messageInfo.idMessages)
            .then(() => {
                enqueueSnackbar(translate("messageDeleted"), {
                    variant: "success"
                })
            })
            .catch((error) => {
                enqueueSnackbar(error.message, {
                    variant: "error"
                })
                setFetching(false)
            })
    }

    renderFolderTree(node, inital = false) {
        if (!node)
            return null;
        const { classes } = this.props;
        const { targetFolder } = this.state;
        if (inital)
            return (
                <Tree content="/" open>
                    {this.renderFolderTree(node[0])}
                </Tree>
            )
        else
            return (
                <Tree
                    open
                    content={node.name}
                    type={(
                        <Radio
                            checked={targetFolder === node.id}
                            onChange={(e, checked) => {
                                if (checked)
                                    this.setState({ targetFolder: node.id });
                            }}
                            value={node.id}
                            name="radio-button-demo"
                            aria-label={node.name}
                            classes={{
                                root: classes.unsetDimensions
                            }}
                        />
                    )
                    }
                >
                    {node.childFolders.length > 0 ? node.childFolders.map(folder => this.renderFolderTree(folder)) : null}
                </Tree>
            )
    }

    render() {
        const { isExternal, fields, timeToDie } = this.state;
        const { isFetching, isOpen, credential, isCreating, isEditing, users, classes, sendResult,
            folderTree, choosingCredentialLocation, moveToCredentialLocationStep, readonly, translate } = this.props;


        const modalCloseFunction = isEditing ? () => { } : closeModal

        return (
            <Dialog
                open={isOpen}
                maxWidth="lg"
                fullWidth
                TransitionComponent={Zoom}
                onBackDropclick={modalCloseFunction}
                onEscapeKeyDown={modalCloseFunction}
            >
                <DialogTitle>
                    {!isFetching && <ModalHeader />}
                </DialogTitle>
                <DialogContent>
                    {isFetching && <Fade in><CircularProgress /></Fade>}
                    <Fade in={!isFetching && !sendResult && !choosingCredentialLocation}>
                        <div style={{ display: !isFetching && !sendResult && !choosingCredentialLocation ? "flex" : "none", flexDirection: "column", alignItems: "center", position: "relative" }}>
                            {isCreating && (
                                <div style={{ display: "flex", width: "100%" }}>
                                    {
                                        !isExternal ? (
                                            <UserAutoComplete
                                                className={classNames(classes.margin, classNames.textField)}
                                                placeholder={translate("receiver")}
                                                keepValue
                                                value={fields.receiver.value}
                                                suggestions={users.map(user => ({ value: user.username, label: user.username }))}
                                                disabled={!isEditing}
                                                onSuggestionAccepted={({ value }) => {
                                                    this.setState(prevState => ({
                                                        ...prevState,
                                                        fields: {
                                                            ...prevState.fields,
                                                            receiver: {
                                                                value: value,
                                                                sanitizedValue: value,
                                                                valid: true
                                                            }
                                                        }
                                                    }))
                                                }}
                                            />
                                        ) : (
                                                <FormControl error={!fields.receiver.valid} disabled={!isEditing} className={classNames(classes.margin, classes.textField)}>
                                                    <InputLabel htmlFor="receiver"><Translate id="receiver" /></InputLabel>
                                                    <Input
                                                        id="receiver"
                                                        value={fields.receiver.value}
                                                        type="email"
                                                        onChange={this._handleChange('receiver')}
                                                    />
                                                    <Grow in={!fields.receiver.valid}>
                                                        <FormHelperText><Translate id="receiverNotMandatory" /></FormHelperText>
                                                    </Grow>
                                                </FormControl>
                                            )
                                    }

                                    <FormControl classes={{ root: classes.timeToDieRoot }}>
                                        <InputLabel shrink htmlFor="time-to-die">
                                            <Translate id="ttl" />
                                        </InputLabel>
                                        <Select
                                            value={timeToDie}
                                            onChange={event => {
                                                this.setState({ timeToDie: event.target.value });
                                            }}
                                            input={<Input name="time-to-die" id="time-to-die" />}
                                            name="time-to-die"
                                        >
                                            {
                                                timeToDieOptions.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                    <FormControlLabel
                                        control={(
                                            <Checkbox
                                                checked={isExternal}
                                                onChange={(event, checked) => { this.setState({ isExternal: checked }) }}
                                                value="checkedB"
                                                color="primary"
                                            />
                                        )}
                                        className={classes.leftMargin}
                                        label={translate("isExternalUser")}
                                        classes={{ root: classes.timeToDieRoot }}
                                        disabled={!isEditing}
                                    />
                                </div>
                            )}
                            <CredentialForm isEditing={isEditing && isCreating && !credential} credential={credential} onFormChanged={(form) => { this.setState({ credentialForm: form }); }} />
                            <TextField
                                id="message"
                                label={translate("message")}
                                disabled={!isEditing || !isCreating}
                                value={fields.message.value}
                                error={!fields.message.valid}
                                onChange={this._handleChange('message')}
                                margin="normal"
                                multiline
                                rows={5}
                                className={classNames(classes.margin, classes.textField)}
                            />
                        </div>
                    </Fade>
                    <Fade in={!isFetching && sendResult && !choosingCredentialLocation}>
                        <div style={{ display: (sendResult ? "flex" : "none"), flexDirection: "column", position: "absolute" }}>
                            {sendResult && sendResult.sent && <Typography><Translate id="emailSent" /></Typography>}
                            {sendResult && sendResult.externalKey && (
                                <Typography>
                                    <Translate id="youCanAccess" />
                                    <a href={getFrontServerPath() + sendResult.externalKey} target="_blank" rel="noopener noreferrer">
                                        <Translate id="link" />
                                    </a>
                                </Typography>
                            )}
                        </div>
                    </Fade>
                    <Slide in={!isFetching && choosingCredentialLocation}>
                        <div style={{ display: (choosingCredentialLocation ? "flex" : "none"), flexDirection: "column" }}>
                            {this.renderFolderTree(folderTree, true)}
                        </div>
                    </Slide>
                </DialogContent>
                {
                    !isCreating ? (
                        <Fade in={isEditing || readonly}>
                            <DialogActions>
                                {(readonly || isEditing) && (
                                    <Button variant="contained" onClick={this.attemptDelete} disabled >
                                        <Translate id="delete" />
                                    </Button>
                                )
                                }
                                <div style={{ flex: 1 }} />
                                {!readonly && (
                                    !choosingCredentialLocation ? (
                                        <Button variant="contained" style={{ justifySelf: "flex-start" }} onClick={moveToCredentialLocationStep} color="secondary">
                                            <Translate id="chooseLocation" />
                                        </Button>
                                    ) : (
                                            <Button variant="contained" style={{ justifySelf: "flex-start" }} onClick={() => { this.saveMessageCredential() }} color="secondary">
                                                <Translate id="save" />
                                                {" "}
                                                <Translate id="credential" />
                                            </Button>
                                        )
                                )
                                }
                            </DialogActions>
                        </Fade>
                    ) : (
                            <Fade in>
                                <DialogActions>
                                    <Button variant="contained" onClick={this.sendMessage}>
                                        <Translate id="send" />
                                    </Button>
                                </DialogActions>
                            </Fade>
                        )
                }
            </Dialog>
        )
    }
}

const mapStateToProps = (state) => ({
    credential: state.messages.modal.baseCredentialInfo,
    isOpen: state.messages.modal.open,
    isFetching: state.messages.modal.isFetching,
    isEditing: state.messages.modal.isEditing || state.messages.modal.isCreating,
    isCreating: state.messages.modal.isCreating,
    readonly: state.messages.modal.readonly,
    users: state.messages.modal.userList,
    sendResult: state.messages.modal.sendResult,
    folderTree: state.messages.modal.folderTree,
    choosingCredentialLocation: state.messages.modal.choosingCredentialLocation,
    messageInfo: state.messages.modal.messageInfo,
})

const mapDispatchToProps = {
    sendMessage,
    setFetching,
    moveToCredentialLocationStep,
    saveCredential,
    deleteMessage,
    closeModal
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(withLocalize(MessageModal))))
