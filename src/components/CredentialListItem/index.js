import React from 'react'
import PropTypes from 'prop-types'
import { ListItem, Avatar, ListItemText, Typography, Button, Fade, ListItemIcon, MenuItem, Badge } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock'
import PersonIcon from '@material-ui/icons/Person'
import CallMadeIcon from '@material-ui/icons/CallMade'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import { withStyles } from '@material-ui/core/styles'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import CopyIcon from '@material-ui/icons/FileCopyOutlined'
import OpenIcon from '@material-ui/icons/OpenInNew'
import { withSnackbar } from 'notistack'
import Validator from 'validator'
import { withLocalize, Translate } from 'react-localize-redux'
import localization from './localization.json'
import CredentialModal from '../CredentialModal'
import ContextMenu from '../ContextMenu/index'

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
    itemWithTextAligned: {
        '& p':{
            textAlign: 'right'
        }
    }
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
        const { classes, credential, style, openCredential, enqueueSnackbar, translate, modalOpen, closeModal, onRequestRefresh, history } = this.props;
        const { hovered } = this.state;

        console.log(credential)

        return (
            <div>
                <ContextMenu
                    items={[
                        <MenuItem onClick={() => { openCredential(credential.idCredentials) }} key="open">
                            <ListItemIcon className={classes.icon}>
                                <OpenInBrowserIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText inset primary={translate("open") + " " + translate("credential")} />
                        </MenuItem>,
                    
                        <CopyToClipboard
                            key="copy-username"
                            text={credential.username}
                            onCopy={() => { enqueueSnackbar(translate("usernameCopied")) }}
                        >
                            <MenuItem>
                                <ListItemIcon className={classes.icon}>
                                    <Badge badgeContent={<PersonIcon color="primary" size="inherit" />}>
                                        <CopyIcon color="primary" />
                                    </Badge>
                                </ListItemIcon>
                                <ListItemText inset primary={translate("copy") + " " + translate("username")} />
                            </MenuItem>
                        </CopyToClipboard>,
                        <CopyToClipboard
                            key="copy-password"
                            text={credential.password}
                            onCopy={() => { enqueueSnackbar(translate("passwordCopied")) }}
                        >
                            <MenuItem>
                                <ListItemIcon className={classes.icon}>
                                    <Badge badgeContent={<LockIcon color="primary" size="inherit" />}>
                                        <CopyIcon color="primary" />
                                    </Badge>
                                </ListItemIcon>
                                <ListItemText inset primary={translate("copy") + " " + translate("password")} />
                            </MenuItem>
                        </CopyToClipboard>,
                        <CopyToClipboard
                            key="copy-password"
                            text={credential.url}
                            onCopy={() => { enqueueSnackbar(translate("urlCopied")) }}
                        >
                            <MenuItem disabled={!Validator.isURL(credential.url)} key="copy-url">
                                <ListItemIcon className={classes.icon}>
                                    <Badge badgeContent={<CallMadeIcon color="primary" size="inherit" />}>
                                        <CopyIcon color="primary" />
                                    </Badge>
                                </ListItemIcon>
                                <ListItemText inset primary={translate("copy") + " " + translate("url")} />
                            </MenuItem>
                        </CopyToClipboard>,
                        <MenuItem disabled={!Validator.isURL(credential.url)} key="open-url" onClick={() => { window.open(credential.url, '_blank') }}>
                            <ListItemIcon className={classes.icon}>
                                <OpenIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText inset primary={translate("open") + " " + translate("url")} />
                        </MenuItem>
                    ]}
                >
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
                            primary={<Typography>{ (credential.path ? (credential.path && credential.path[0] && credential.path[0].name ? credential.path[0].name : 'Raiz') + ' / ' : '') + credential.title}</Typography>}
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
                </ContextMenu>
                <CredentialModal
                history={history}
                    belongsTo={credential.belongsToFolder}
                    credentialId={credential.idCredentials}
                    open={modalOpen}
                    openCredential={openCredential}
                    closeModal={closeModal}
                    onRequestRefresh={onRequestRefresh}
                />
            </div>
        )
    }
}

export default withStyles(styles)(withSnackbar(withLocalize(CredentialListItem)))