import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { IconButton, TextField, FormControl, Input, InputLabel, InputAdornment, FormControlLabel, Checkbox, ClickAwayListener, Collapse, FormHelperText, Grow } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles'
import CopyIcon from '@material-ui/icons/FileCopy'
import VisibilityIcon from '@material-ui/icons/Visibility'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'
import RefreshIcon from '@material-ui/icons/Refresh'
import OpenIcon from '@material-ui/icons/OpenInNew'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { withSnackbar } from 'notistack';
import PasswordGenerator from 'generate-password'
import Validator from 'validator'
import _ from 'lodash'

const styles = theme => ({
    form: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%"
    },
    textField: {
        flex: 1
    },
    textFieldContainer: {
        display: "flex",
        alignItems: "baseline"
    },
    margin: {
        margin: theme.spacing.unit
    }
});

export class Form extends Component {
    static propTypes = {
        credential: PropTypes.object,
        classes: PropTypes.object.isRequired,
        enqueueSnackbar: PropTypes.func.isRequired,
        isEditing: PropTypes.bool.isRequired,
        onFormChanged: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this._onFormChanged = _.debounce(props.onFormChanged, 100);
        this._handleChange = this._handleChange.bind(this);
        this._handleClickShowPassword = this._handleClickShowPassword.bind(this);
        this._handlePasswordGenerationChange = this._handlePasswordGenerationChange.bind(this)
        this._generatePassword = this._generatePassword.bind(this)
        this._fieldsFromCredential = this._fieldsFromCredential.bind(this)
        this.updateFormToMatchStore = this.updateFormToMatchStore.bind(this)

        this.state = {
            fields: this._fieldsFromCredential(props.credential),
            showPassword: false,
            passwordGenerationOptions: {
                length: 16,
                numbers: true,
                symbols: false,
                uppercase: true,
                excludeSimilarCharacters: true
            },
            passwordGenerationToolsShow: false
        };
    }

    componentDidMount() {
        this.updateFormToMatchStore();
    }

    componentDidUpdate(prevProps, prevState) {
        const { fields } = this.state;
        const { isEditing, credential } = this.props;


        if((prevProps.isEditing && !isEditing) || prevProps.credential !== credential)
            this.updateFormToMatchStore()

        if (prevState.fields !== fields)
            this._onFormChanged(fields)
    }

    _fieldsFromCredential = (credential) => {
        if (credential == null)
            credential = {
                description: "",
                username: "",
                title: "",
                url: "",
                password: ""
            }

        return {
            description: this._handleChange('description', credential.description)(),
            password: this._handleChange('password', credential.password)(),
            username: this._handleChange('username', credential.username)(),
            title: this._handleChange('title', credential.title)(),
            url: this._handleChange('url', credential.url)(),
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
            case 'username':
            case 'description':
                valid = true;
                break;
            case 'password':
            case 'title':
                valid = !Validator.isEmpty(sanitizedValue);
                break;
            case 'url':
                valid = Validator.isEmpty(sanitizedValue) || Validator.isURL(sanitizedValue);
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

    _handlePasswordGenerationChange = name => (event, checked) => {
        event.persist();
        this.setState(prevState => ({
            ...prevState,
            passwordGenerationOptions: {
                ...prevState.passwordGenerationOptions,
                [name]: (name === "length" ? event.target.value : checked),
            }
        }));
    }

    _handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
    };

    _generatePassword() {
        this.setState(prevState => ({
            passwordGenerationToolsShow: true,
            fields: {
                ...prevState.fields,
                password: this._handleChange('password', PasswordGenerator.generate(prevState.passwordGenerationOptions))()
            }
        }));
    }

    updateFormToMatchStore(){
        const { credential} = this.props;
        const newFields = this._fieldsFromCredential(credential)
        this.setState({ fields: newFields });
        this._onFormChanged(newFields);
    }

    render() {
        const { classes, enqueueSnackbar, isEditing } = this.props;
        const { fields, showPassword, passwordGenerationOptions, passwordGenerationToolsShow } = this.state;

        return (
            <div className={classes.form}>
                <FormControl error={!fields.title.valid} disabled={!isEditing} className={classNames(classes.margin, classes.textField)}>
                    <InputLabel htmlFor="title">Title</InputLabel>
                    <Input
                        id="title"
                        type='text'
                        value={fields.title.value}
                        onChange={this._handleChange('title')}
                    />
                    <Grow in={!fields.title.valid}>
                        <FormHelperText>The title is mandatory</FormHelperText>
                    </Grow>
                </FormControl>
                <FormControl error={!fields.username.valid} disabled={!isEditing} className={classNames(classes.margin, classes.textField)}>
                    <InputLabel htmlFor="adornment-username">Username</InputLabel>
                    <Input
                        id="adornment-username"
                        type='text'
                        value={fields.username.value}
                        onChange={this._handleChange('username')}
                        endAdornment={(
                            <InputAdornment position="end">
                                <CopyToClipboard
                                    text={fields.username.value}
                                    onCopy={() => { enqueueSnackbar("Username copied") }}
                                >
                                    <IconButton aria-label="Copy username to clipboard">
                                        <CopyIcon color="primary" />
                                    </IconButton>
                                </CopyToClipboard>
                            </InputAdornment>
                        )}
                    />
                </FormControl>
                <ClickAwayListener onClickAway={() => { this.setState({ passwordGenerationToolsShow: false }) }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <FormControl error={!fields.password.valid} disabled={!isEditing} className={classNames(classes.margin, classes.textField)}>
                            <InputLabel htmlFor="adornment-password">Password</InputLabel>
                            <Input
                                id="adornment-password"
                                type={showPassword ? 'text' : 'password'}
                                value={fields.password.value}
                                onChange={this._handleChange('password')}
                                endAdornment={(
                                    <InputAdornment position="end">
                                        <IconButton aria-label="Toggle password visibility" onClick={this._handleClickShowPassword}>
                                            {showPassword ? <VisibilityIcon color="primary" /> : <VisibilityOffIcon color="primary" />}
                                        </IconButton>
                                        <CopyToClipboard
                                            text={fields.password.value}
                                            onCopy={() => { enqueueSnackbar("Password copied") }}
                                        >
                                            <IconButton aria-label="Copy password to clipboard">
                                                <CopyIcon color="primary" />
                                            </IconButton>
                                        </CopyToClipboard>
                                        <IconButton disabled={!isEditing} aria-label="Generate password" onClick={this._generatePassword}>
                                            <RefreshIcon color="primary" />
                                        </IconButton>
                                    </InputAdornment>
                                )}
                            />
                            <Grow in={!fields.password.valid}>
                                <FormHelperText>The password is a mandatory field, try generating a new one...</FormHelperText>
                            </Grow>
                        </FormControl>
                        <Collapse in={passwordGenerationToolsShow}>
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                                <TextField
                                    id="password-length"
                                    label="Length"
                                    type="text"
                                    value={passwordGenerationOptions.length}
                                    onChange={this._handlePasswordGenerationChange('length')}
                                    margin="normal"
                                />
                                <FormControlLabel control={<Checkbox checked={passwordGenerationOptions.numbers} onChange={this._handlePasswordGenerationChange('numbers')} />} label="Números" />
                                <FormControlLabel control={<Checkbox checked={passwordGenerationOptions.symbols} onChange={this._handlePasswordGenerationChange('symbols')} />} label="Simbolos" />
                                <FormControlLabel control={<Checkbox checked={passwordGenerationOptions.uppercase} onChange={this._handlePasswordGenerationChange('uppercase')} />} label="Letras maiusculas" />
                                <FormControlLabel control={<Checkbox checked={passwordGenerationOptions.excludeSimilarCharacters} onChange={this._handlePasswordGenerationChange('excludeSimilarCharacters')} />} label="Excluir caracteres semelhantes" />
                            </div>
                        </Collapse>
                    </div>
                </ClickAwayListener>
                <FormControl error={!fields.url.valid} disabled={!isEditing} className={classNames(classes.margin, classes.textField)}>
                    <InputLabel htmlFor="adornment-url">Url</InputLabel>
                    <Input
                        id="adornment-url"
                        value={fields.url.value}
                        type="text"
                        onChange={this._handleChange('url')}
                        endAdornment={fields.url.valid && !Validator.isEmpty(fields.url.sanitizedValue) && (
                            <InputAdornment position="end">
                                <IconButton aria-label="Copy open credential url">
                                    <OpenIcon color="primary" />
                                </IconButton>
                            </InputAdornment>
                        )}
                    />
                    <Grow in={!fields.url.valid}>
                        <FormHelperText>This url is malformed! This is not a mandatory field, if you must, leave it on the description.</FormHelperText>
                    </Grow>
                </FormControl>
                <TextField
                    id="description"
                    label="Description"
                    disabled={!isEditing}
                    value={fields.description.value}
                    error={!fields.description.valid}
                    onChange={this._handleChange('description')}
                    margin="normal"
                    multiline
                    rows={5}
                    className={classNames(classes.margin, classes.textField)}
                />
            </div>
        )
    }
}

export default withStyles(styles)(withSnackbar(Form))