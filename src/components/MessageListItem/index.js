import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ListItem, Avatar, ListItemText, Typography, Chip } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder'
import MessageIcon from '@material-ui/icons/Message'
import GroupIcon from '@material-ui/icons/Group'
import { withStyles } from '@material-ui/core/styles'
import { openMessage } from '../../actions/MessageActions'

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
    }
});


const MessageListItem = (props) => {
    const { classes, style, received, receiverId, senderId, title, message, messageId, openMessage } = props;

    return (
        <ListItem style={{ ...style }} button onClick={() => { openMessage(messageId, !received) }}>
            <Avatar className={classes.avatar}>
                <MessageIcon style={{ height: 32, width: 32 }} />
            </Avatar>
            <ListItemText
                style={{ flex: 1 }}
                primary={(
                    <Typography>
                        {received ? "Enviada por: " : "Destinatário: "}
                        {received ? senderId : receiverId}
                    </Typography>
                )}
                secondary={(
                    <Typography variant="caption" noWrap>
                        {message ? "Mensagem: " + message : "Titulo da credencial: " + title}
                    </Typography>
                )}
            />
            {/*<div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
                <Chip
                    className={classes.margin}
                    avatar={<Avatar><FolderIcon color="primary" /></Avatar>}
                    label={`${folder.folderChildren} pastas contidas`}
                />
                <Chip
                    className={classes.margin}
                    avatar={<Avatar><KeyIcon color="primary" /></Avatar>}
                    label={`${folder.credentialChildren} credenciais contidas`}
                />
            </div>
    */}
        </ListItem>
    )
}

MessageListItem.propTypes = {
    classes: PropTypes.object.isRequired,
    received: PropTypes.bool.isRequired,
    receiverId: PropTypes.string,
    senderId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    style: PropTypes.object,
    messageId: PropTypes.string.isRequired,
}

const mapStateToProps = () => ({

})

const mapDispatchToProps = {
    openMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MessageListItem))