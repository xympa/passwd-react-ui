/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CircularProgress, Dialog, DialogContent, DialogTitle, DialogActions, Button, Zoom, Fade } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles'
import { withSnackbar } from 'notistack';
import CredentialForm from './Form'
import ModalHeader from './Header'
import { updateCredential, deleteCredential, insertCredential, setFetching } from '../../actions/CredentialActions'


const styles = () => ({

})

export class CredentialModal extends Component {
    static propTypes = {
        isFetching: PropTypes.bool.isRequired,
        openId: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        isEditing: PropTypes.bool.isRequired,
        updateCredential: PropTypes.func.isRequired,
        deleteCredential: PropTypes.func.isRequired,
        insertCredential: PropTypes.func.isRequired,
        isCreating: PropTypes.bool.isRequired,
        enqueueSnackbar: PropTypes.func.isRequired,
        setFetching: PropTypes.func.isRequired,
        credential: PropTypes.object,
    }

    constructor(props) {
        super(props)

        this.state = {
            isShowing: false,
            form: {}
        }

        this.submitFormForUpdate = this.submitFormForUpdate.bind(this)
        this.submitFormForInsert = this.submitFormForInsert.bind(this)
        this.attemptDelete = this.attemptDelete.bind(this)
    }


    componentDidUpdate(prevProps) {
        const { openId, isCreating } = this.props;

        if (openId !== prevProps.openId || isCreating !== prevProps.isCreating)
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ isShowing: openId !== null || isCreating })
    }

    submitFormForUpdate() {
        const { updateCredential, enqueueSnackbar, setFetching } = this.props;
        const { form } = this.state;

        const valid = Object.keys(form).filter(field => !form[field].valid).length === 0

        if (valid)
            updateCredential({
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
                    setFetching(false)

                })
        else {
            enqueueSnackbar('Some fields look invalid please check the form again', {
                variant: "error"
            })
        }
    }

    submitFormForInsert() {
        const { insertCredential, enqueueSnackbar, setFetching } = this.props;
        const { form } = this.state;

        const valid = Object.keys(form).filter(field => !form[field].valid).length === 0

        if (valid)
            insertCredential({
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
                    setFetching(false)
                })
        else {
            enqueueSnackbar('Some fields look invalid please check the form again', {
                variant: "error"
            })
        }
    }

    attemptDelete() {
        const { deleteCredential, enqueueSnackbar, setFetching } = this.props;
        deleteCredential()
            .catch((error) => {
                enqueueSnackbar(error.message, {
                    variant: "error"
                })
                setFetching(false)
            })
    }

    render() {
        const { isShowing } = this.state;
        const { isFetching, isEditing, isCreating, credential } = this.props;

        return (
            <Dialog open={isShowing} maxWidth="lg" TransitionComponent={Zoom}>
                <DialogTitle>
                    {!isFetching && <ModalHeader />}
                </DialogTitle>
                <DialogContent>
                    {isFetching && <CircularProgress />}
                    <div style={isFetching ? { display: "none" } : {}}>
                    <CredentialForm isEditing={isEditing} credential={credential} onFormChanged={(form) => { this.setState({ form: form }); }} />
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
            </Dialog>
        )
    }
}

const mapStateToProps = (state) => ({
    credential: state.credential.data,
    openId: state.credential.openCredential,
    isFetching: state.credential.fetchingCredential,
    isEditing: state.credential.isEditing || state.credential.isCreating,
    isCreating: state.credential.isCreating
})

const mapDispatchToProps = {
    updateCredential,
    deleteCredential,
    insertCredential,
    setFetching
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(CredentialModal)))
