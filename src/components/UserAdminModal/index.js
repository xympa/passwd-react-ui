import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import Validator from 'validator'
import { Dialog, DialogTitle, DialogActions, Button, DialogContent, Fade, Zoom, CircularProgress } from '@material-ui/core'
import { requestUser } from '../../actions/UserActions'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import ModalHeader from './Header'

const INITIAL_STATE = {
    isEditing: false,
    isShowing: false,
    user: null,
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
    }

    static defaultProps = {
        forCreation: false
    }

    constructor(props) {
        super(props)

        this.state = INITIAL_STATE
    }

    componentDidUpdate(prevProps, prevState) {
        const { requestUser, username, open } = this.props

        if (prevProps.open !== open) {
            if (open)
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({ isFetching: true }, () => {
                    requestUser(username)
                        .then(({ data }) => {
                            console.log(data)
                            this.setState({
                                user: data,
                                form: {
                                    ...this._formFromUser(data),
                                    ldap: data.ldap == "1",
                                    sysadmin: data.sysadmin == "1"
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

        let valid;

        switch (name) {
            case 'email':
                valid = Validator.isEmail(sanitizedValue) && !Validator.isEmpty(sanitizedValue)
                break;
            case 'ldap':
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


    _formFromUser(user) {
        return {
            username: this._handleChange('username', user.username),
            email: this._handleChange('email', user.email),
            password: this._handleChange('password', ''),
        }

    }



    render() {
        const { isFetching, isEditing } = this.state
        const { forCreation, open, onRequestClose } = this.props


        return (
            <Dialog open={open} maxWidth="lg" TransitionComponent={Zoom} disableRestoreFocus>
                <DialogTitle>
                    {!isFetching && (
                        <ModalHeader
                            isEditing={isEditing}
                            isCreating={forCreation}
                            closeModal={onRequestClose}
                        />
                    )}
                </DialogTitle>
                <DialogContent>
                    {isFetching && <CircularProgress />}
                    <div style={isFetching ? { display: "none" } : {}}>


                    
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
    removeSearchAction,
    replaceSearchAction,
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserAdminModal))