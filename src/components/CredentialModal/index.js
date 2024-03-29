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
import MoveModal from './MoveModal';


const INITIAL_STATE = {
    isEditing: false,
    isFetching: true,
    isMoving: false,
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
        ]).isRequired,
        onRequestRefresh: PropTypes.func.isRequired,
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
        this._handleCredentialLoad = this._handleCredentialLoad.bind(this)
        this.startMoving = this.startMoving.bind(this)
        this.cancelMoving = this.cancelMoving.bind(this)
    }

    componentDidMount() {
        this._handleCredentialLoad()
    }

    componentDidUpdate(prevProps) {
        const { open } = this.props

        if (prevProps.open !== open) {
            this._handleCredentialLoad()
        }
    }

    startMoving(){
        this.setState({isMoving: true})
    }

    cancelMoving(){
        this.setState({isMoving: false})
    }

    submitFormForUpdate() {
        const { requestCredentialUpdate, enqueueSnackbar, translate, belongsTo, credentialId, onRequestRefresh } = this.props;
        const { form } = this.state;

        const valid = Object.keys(form).filter(field => !form[field].valid).length === 0

        if (valid) {
            this.setState({
                isFetching: true
            }, () => {
                requestCredentialUpdate(credentialId, belongsTo, {
                    description: form.description.sanitizedValue,
                    username: form.username.sanitizedValue,
                    title: form.title.sanitizedValue,
                    password: form.password.sanitizedValue,
                    url: form.url.sanitizedValue,
                })
                    .then(() => {
                        enqueueSnackbar(translate("credentialUpdated"), {
                            variant: "success"
                        })
                        onRequestRefresh(credentialId);
                        this.setState({ isEditing: false})

                    })
                    .catch((error) => {
                        enqueueSnackbar(error.message, {
                            variant: "error"
                        })
                    })
                    .finally(() => {
                        this.setState({ isFetching: false});
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
        const { requestCredentialInsertion, enqueueSnackbar, translate, belongsTo, onRequestRefresh } = this.props;
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
                }, belongsTo)
                    .then(newId => {
                        enqueueSnackbar(translate("credentialCreated"), {
                            variant: "success"
                        })
                        onRequestRefresh(newId);
                    })
                    .catch((error) => {
                        enqueueSnackbar(error.message, {
                            variant: "error"
                        })
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
        const { requestCredentialDeletion, enqueueSnackbar, credentialId, translate, onRequestRefresh } = this.props;

        this.setState({
            isFetching: true
        }, () => {
            requestCredentialDeletion(credentialId)
                .then(() => {
                    enqueueSnackbar(translate("credentialDeleted"), {
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
                    this.setState({ isFetching: false })
                    onRequestRefresh()
                })
        })

    }

    _handleCredentialLoad() {
        const { requestCredentialInfo, open, credentialId } = this.props

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

    render() {
        const { credential, isFetching, isEditing, isMoving } = this.state;
        const { forCreation, open, closeModal, credentialId, history, belongsTo } = this.props;

        const modalCloseFunction = isEditing ? () => {} : closeModal



        return (
            <React.Fragment>
                 <MoveModal currentFolder={belongsTo} history={history} credentialId={credentialId} cancel={this.cancelMoving} visible={isMoving} />
            <Dialog
                open={open && !isMoving}
                disableBackdropClick
                disableRestoreFocus
                maxWidth="lg"
                fullWidth
                TransitionComponent={Zoom}
                onBackdropClick={modalCloseFunction}
                onEscapeKeyDown={modalCloseFunction}
            >
                <DialogTitle>
                    {!isFetching && (
                        <ModalHeader
                            closeCredential={closeModal}
                            isEditing={isEditing}
                            isCreating={forCreation}
                            toggleEditMode={() => {
                                this.setState(prevState => ({ isEditing: !prevState.isEditing }))
                            }}
                            moveCredential={this.startMoving}
                            credentialId={credentialId}
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
            </Dialog>
            </React.Fragment>
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
