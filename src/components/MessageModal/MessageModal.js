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
import CredentialForm from '../CredentialModal/Form'
import ModalHeader from './Header'
import UserAutoComplete from '../FolderAdministrationModal/UserAutocomplete'
import { sendMessage, setFetching, getFrontServerPath, moveToCredentialLocationStep, saveCredential } from '../../actions/MessageActions'

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
        flex: "0 1 40%"
    },
    isExternalRoot: {
        flex: "0 1 33%"
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
        const { enqueueSnackbar, saveCredential, setFetching, messageInfo } = this.props;
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

    sendMessage() {
        const { enqueueSnackbar, sendMessage, credential, setFetching } = this.props;
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
            folderTree, choosingCredentialLocation, moveToCredentialLocationStep, readonly } = this.props;

        return (
            <Dialog open={isOpen} maxWidth="lg" fullWidth TransitionComponent={Zoom}>
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
                                                placeholder="Destinatário"
                                                suggestions={users.map(user => ({ value: user.username, label: user.username }))}
                                                disabled={!isEditing}
                                                onAutocomplete={username => {
                                                    this.setState(prevState => ({
                                                        ...prevState,
                                                        fields: {
                                                            ...prevState.fields,
                                                            receiver: {
                                                                value: username,
                                                                sanitizedValue: username,
                                                                valid: true
                                                            }
                                                        }
                                                    }))
                                                }}
                                            />
                                        ) : (
                                                <FormControl error={!fields.receiver.valid} disabled={!isEditing} className={classNames(classes.margin, classes.textField)}>
                                                    <InputLabel htmlFor="email">Destinatário</InputLabel>
                                                    <Input
                                                        id="email"
                                                        value={fields.receiver.value}
                                                        type="email"
                                                        onChange={this._handleChange('receiver')}
                                                    />
                                                    <Grow in={!fields.receiver.valid}>
                                                        <FormHelperText>The sender must be a valid email or nothing at all to only generate a link...</FormHelperText>
                                                    </Grow>
                                                </FormControl>
                                            )
                                    }

                                    <FormControl classes={{ root: classes.timeToDieRoot }}>
                                        <InputLabel shrink htmlFor="time-to-die">
                                            Time to die
                                        </InputLabel>
                                        <Select
                                            style={{ width: 150 }}
                                            value={timeToDie}
                                            onChange={event => {
                                                this.setState({ timeToDie: event.target.value });
                                            }}
                                            input={<Input name="time-to-die" id="time-to-die" />}
                                            name="time-to-die"
                                            className={classes.selectEmpty}
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
                                            />)
                                        }
                                        className={classes.leftMargin}
                                        label="Utilizador externo?"
                                        classes={{ root: classes.timeToDieRoot }}
                                        disabled={!isEditing}
                                    />
                                </div>
                            )}
                            <CredentialForm isEditing={isEditing && isCreating && !credential} credential={credential} onFormChanged={(form) => { this.setState({ credentialForm: form }); }} />
                            <TextField
                                id="message"
                                label="Message"
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
                            {sendResult && sendResult.sent && <Typography>Foi enviado um email para o destinatário.</Typography>}
                            {sendResult && sendResult.externalKey && (
                                <Typography>
                                    Pode aceder à credencial através do seguinte
                                    <a href={getFrontServerPath() + sendResult.externalKey} target="_blank" rel="noopener noreferrer"> link</a>
                                </Typography>
                            )}
                        </div>
                    </Fade>
                    <Slide in={!isFetching && choosingCredentialLocation}>
                        <div style={{ display: (choosingCredentialLocation ? "flex" : "none"), flexDirection: "column" }}>
                            {
                                this.renderFolderTree(folderTree, true)
                            }
                        </div>
                    </Slide>
                </DialogContent>
                {
                    !readonly && (
                        !isCreating ? (
                            <Fade in={isEditing}>
                                <DialogActions>
                                    <Button variant="contained" onClick={this.attemptDelete}>
                                        Delete
                                    </Button>
                                    <div style={{ flex: 1 }} />
                                    {!choosingCredentialLocation ? (
                                        <Button variant="contained" style={{ justifySelf: "flex-start" }} onClick={moveToCredentialLocationStep} color="secondary">
                                            Choose Location
                                        </Button>
                                    ) : (
                                            <Button variant="contained" style={{ justifySelf: "flex-start" }} onClick={() => { this.saveMessageCredential() }} color="secondary">
                                                Save Credential
                                            </Button>
                                        )
                                    }
                                </DialogActions>
                            </Fade>) : (
                                <Fade in>
                                    <DialogActions>
                                        <Button variant="contained" onClick={this.sendMessage}>
                                            Send
                                        </Button>
                                    </DialogActions>
                                </Fade>
                            )
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
    messageInfo: state.messages.modal.messageInfo
})

const mapDispatchToProps = {
    sendMessage,
    setFetching,
    moveToCredentialLocationStep,
    saveCredential
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(MessageModal)))
