/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CircularProgress, Dialog, DialogContent, DialogTitle, DialogActions, Button, Zoom, Fade } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles'
import CredentialForm from './Form'
import ModalHeader from './Header'
import { updateCredential, deleteCredential } from '../../actions/CredentialActions'


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
    }

    constructor(props) {
        super(props)

        this.state = {
            isShowing: false,
            form: {}
        }

        this.submitForm = this.submitForm.bind(this)
    }


    componentDidUpdate(prevProps) {
        const { openId } = this.props;

        if (openId !== prevProps.openId)
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ isShowing: openId !== null })

    }

    submitForm() {
        const { updateCredential } = this.props;
        const { form } = this.state;

        updateCredential({
            description: form.description.sanitizedValue,
            username: form.username.sanitizedValue,
            title: form.title.sanitizedValue,
            password: form.password.sanitizedValue,
            url: form.url.sanitizedValue,
        })
    }

    render() {
        const { isShowing } = this.state;
        const { isFetching, isEditing, deleteCredential } = this.props;

        return (
            <Dialog open={isShowing} maxWidth="lg" TransitionComponent={Zoom}>
                <DialogTitle>
                    {!isFetching && <ModalHeader />}
                </DialogTitle>
                <DialogContent>
                    {isFetching && <CircularProgress />}
                    {!isFetching && <CredentialForm onFormChanged={(form) => this.setState({ form: form })} />}
                </DialogContent>
                <Fade in={isEditing}>
                    <DialogActions>
                        <Button variant="contained" onClick={deleteCredential}>
                            Delete
                        </Button>
                        <div style={{ flex: 1 }} />
                        <Button variant="contained" style={{ justifySelf: "flex-start" }} onClick={this.submitForm} color="secondary">
                            Save
                        </Button>
                    </DialogActions>
                </Fade>
            </Dialog>
        )
    }
}

const mapStateToProps = (state) => ({
    credential: state.credential.data,
    openId: state.credential.openCredential,
    isFetching: state.credential.fetchingCredential,
    isEditing: state.credential.isEditing
})

const mapDispatchToProps = {
    updateCredential,
    deleteCredential
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CredentialModal))
