/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CircularProgress, Dialog, DialogContent, DialogTitle, DialogActions, Button, Zoom, Fade } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles'
import { Translate, withLocalize } from 'react-localize-redux'
import { withSnackbar } from 'notistack';
import CredentialForm from './Form'
import ModalHeader from './Header'
import { requestCredentialInfo, requestCredentialDeletion, requestCredentialInsertion, requestCredentialUpdate } from '../../actions/CredentialActions'


const INITIAL_STATE = {
    isEditing: false,
    isShowing: false,
    user: null,
    isFetching: true,
    form: {

    }
}

const styles = () => ({

})

export class CredentialModal extends Component {
    static propTypes = {
        credentialId: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        requestCredentialDeletion: PropTypes.func.isRequired,
        requestCredentialInsertion: PropTypes.func.isRequired,
        requestCredentialUpdate: PropTypes.func.isRequired,
        enqueueSnackbar: PropTypes.func.isRequired,
        translate: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired,
        requestCredentialInfo: PropTypes.func.isRequired,
        forCreation: PropTypes.bool,
        closeModal: PropTypes.func.isRequired,
        belongsTo: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
    }

    static defaultProps = {
        forCreation: false
    }

    constructor(props) {
        super(props)

        this.state = INITIAL_STATE

        this.submitFormForUpdate = this.submitFormForUpdate.bind(this)
        this.submitFormForInsert = this.submitFormForInsert.bind(this)
        this.attemptDelete = this.attemptDelete.bind(this)
    }


    componentDidUpdate(prevProps) {
        const { requestCredentialInfo, open, credentialId } = this.props

        if (prevProps.open !== open) {
            if (open && credentialId)
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({ isFetching: true }, () => {
                    requestCredentialInfo(credentialId)
                        .then(credential => {
                            this.setState({
                                credential,
                                isFetching: false,
                            })
                        })
                        .catch(error => {
                            console.log(error)
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

    submitFormForUpdate() {
        const { requestCredentialUpdate, enqueueSnackbar, translate } = this.props;
        const { form } = this.state;

        const valid = Object.keys(form).filter(field => !form[field].valid).length === 0

        if (valid) {
            this.setState({
                isFetching: true
            }, () => {
                requestCredentialUpdate({
                    description: form.description.sanitizedValue,
                    username: form.username.sanitizedValue,
                    title: form.title.sanitizedValue,
                    password: form.password.sanitizedValue,
                    url: form.url.sanitizedValue,
                })
                    .catch((error) => {
                        enqueueSnackbar(error.message, {
                            variant: "error"
                        })
                    })
                    .then(() => {
                        this.setState({ isFetching: false })
                    })

            })
        }
        else {
            enqueueSnackbar(translate("badForm"), {
                variant: "error"
            })
        }
    }

    submitFormForInsert() {
        const { requestCredentialInsertion, enqueueSnackbar, translate } = this.props;
        const { form } = this.state;

        const valid = Object.keys(form).filter(field => !form[field].valid).length === 0

        if (valid) {
            this.setState({
                isFetching: true
            }, () => {
                requestCredentialInsertion({
                    description: form.description.sanitizedValue,
                    username: form.username.sanitizedValue,
                    title: form.title.sanitizedValue,
                    password: form.password.sanitizedValue,
                    url: form.url.sanitizedValue,
                })
                    .catch((error) => {
                        console.log(error)
                        enqueueSnackbar(error.message, {
                            variant: "error"
                        })
                    })
                    .then(() => {
                        this.setState({ isFetching: false })

                    })
            })
        }
        else {
            enqueueSnackbar(translate("badForm"), {
                variant: "error"
            })
        }
    }

    attemptDelete() {
        const { requestCredentialDeletion, enqueueSnackbar, credentialId } = this.props;

        this.setState({
            isFetching: true
        }, () => {
            requestCredentialDeletion(credentialId)
                .catch((error) => {
                    enqueueSnackbar(error.message, {
                        variant: "error"
                    })
                })
                .then(() => {
                    this.setState({ isFetching: false })

                })
        })

    }

    render() {
        const { credential, isFetching, isEditing } = this.state;
        const { forCreation, open, closeModal } = this.props;

        return (
            <Dialog open={open} disableBackdropClick disableRestoreFocus maxWidth="lg" TransitionComponent={Zoom}>
                <DialogTitle>
                    {!isFetching && (
                        <ModalHeader
                            closeCredential={closeModal}
                            isEditing={isEditing}
                            isCreating={forCreation}
                            toggleEditMode={() => {
                                this.setState(prevState => ({ isEditing: !prevState.isEditing }))
                            }}
                        />
                    )}
                </DialogTitle>
                <DialogContent>
                    {isFetching && <CircularProgress />}
                    <div style={isFetching ? { display: "none" } : {}}>
                        <CredentialForm isEditing={isEditing} credential={credential} onFormChanged={(form) => { this.setState({ form: form }); }} />
                    </div>
                </DialogContent>
                {!forCreation ? (
                    <Fade in={isEditing}>
                        <DialogActions>
                            <Button variant="contained" onClick={this.attemptDelete}>
                                <Translate id="delete" />
                            </Button>
                            <div style={{ flex: 1 }} />
                            <Button variant="contained" style={{ justifySelf: "flex-start" }} onClick={this.submitFormForUpdate} color="secondary">
                                <Translate id="save" />
                            </Button>
                        </DialogActions>
                    </Fade>
                ) : (
                        <Fade in>
                            <DialogActions>
                                <Button variant="contained" onClick={this.submitFormForInsert}>
                                    <Translate id="create" />
                                </Button>
                            </DialogActions>
                        </Fade>
                    )}
            </Dialog>
        )
    }
}

const mapStateToProps = () => ({})

const mapDispatchToProps = {
    requestCredentialDeletion,
    requestCredentialInfo,
    requestCredentialInsertion,
    requestCredentialUpdate
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(withLocalize(CredentialModal))))
