import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ListItem, Avatar, ListItemText, Typography, Chip, Button, Fade } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock'
import GroupIcon from '@material-ui/icons/Group'
import { withStyles } from '@material-ui/core/styles'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import CopyIcon from '@material-ui/icons/FileCopyOutlined'
import OpenIcon from '@material-ui/icons/OpenInNew'
import { withSnackbar } from 'notistack'
import Validator from 'validator'
import { withLocalize, Translate } from 'react-localize-redux'
import localization from './localization.json'
import { openCredential } from '../../actions/CredentialActions'
import CredentialModal from '../CredentialModal';

const styles = theme => ({
    avatar: {
        height: 64,
        width: 64,
        marginRight: 32,
        backgroundColor: theme.palette.secondary.main
    },
    hoveredRow: {
        height: 64,
        backgroundColor: "rgba(0,0,0,0.14)"
    },
    row: {
        height: 96
    },
    margin: {
        margin: 10
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
});

class CredentialListItem extends React.PureComponent {

    static propTypes = {
        classes: PropTypes.object.isRequired,
        credential: PropTypes.object.isRequired,
        style: PropTypes.object,
        openCredential: PropTypes.func.isRequired,
        enqueueSnackbar: PropTypes.func.isRequired,
        translate: PropTypes.func.isRequired,
        addTranslation: PropTypes.func.isRequired,
        modalOpen: PropTypes.bool.isRequired,
        closeModal: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            hovered: false
        }

        const { addTranslation } = this.props
        addTranslation(localization)
    }


    render() {
        const { classes, credential, style, openCredential, enqueueSnackbar, translate, modalOpen, closeModal } = this.props;
        const { hovered } = this.state;

        return (
            <div>
                <ListItem
                    style={{ ...style }}
                    button
                    onClick={() => { openCredential(credential.idCredentials) }}
                    onMouseEnter={() => { this.setState({ hovered: true }) }}
                    onMouseLeave={() => { this.setState({ hovered: false }) }}
                    selected={hovered}
                >
                    <Avatar className={classes.avatar}>
                        <LockIcon style={{ height: 32, width: 32 }} />
                    </Avatar>
                    <ListItemText
                        style={{ flex: 1 }}
                        primary={<Typography>{credential.title}</Typography>}
                        secondary={<Typography variant="caption" noWrap>{credential.description}</Typography>}
                    />

                    <div className={classes.sectionDesktop} style={{ flex: 1, justifyContent: "flex-end", alignItems: "center" }}>
                        <Fade in={hovered}>
                            <div style={{ display: "flex", marginRight: 50 }}>
                                <CopyToClipboard
                                    text={credential.username}
                                    onCopy={() => { enqueueSnackbar(translate("usernameCopied")) }}
                                >
                                    <Button color="secondary" onClick={(event) => { event.stopPropagation() }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <CopyIcon />
                                            <Typography variant="caption" color="secondary">
                                                <Translate id="copy" />
                                            </Typography>
                                            <Typography variant="caption" color="secondary">
                                                <Translate id="username" />
                                            </Typography>
                                        </div>
                                    </Button>
                                </CopyToClipboard>
                                <CopyToClipboard
                                    text={credential.password}
                                    onCopy={() => { enqueueSnackbar(translate("passwordCopied")) }}
                                >
                                    <Button onClick={(event) => { event.stopPropagation() }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <CopyIcon />
                                            <Typography variant="caption">
                                                <Translate id="copy" />
                                            </Typography>
                                            <Typography variant="caption">
                                                <Translate id="password" />
                                            </Typography>
                                        </div>
                                    </Button>
                                </CopyToClipboard>
                                <Button disabled={!Validator.isURL(credential.url)} style={{ marginRight: 20 }} color="secondary" onClick={(event) => { event.stopPropagation(); window.open(credential.url, '_blank') }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <OpenIcon />
                                        <Typography variant="caption" color="secondary" style={!Validator.isURL(credential.url) ? { color: "rgba(0, 0, 0, 0.26)" } : {}}>
                                            <Translate id="open" />
                                        </Typography>
                                        <Typography variant="caption" color="secondary" style={!Validator.isURL(credential.url) ? { color: "rgba(0, 0, 0, 0.26)" } : {}}>
                                            <Translate id="url" />
                                        </Typography>
                                    </div>
                                </Button>
                            </div>
                        </Fade>
                    </div>
                </ListItem>
                <CredentialModal credentialId={credential.idCredentials} open={modalOpen} openCredential={openCredential} closeModal={closeModal} />
            </div>
        )
    }
}

export default withStyles(styles)(withSnackbar(withLocalize(CredentialListItem)))