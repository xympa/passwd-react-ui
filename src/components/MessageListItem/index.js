import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ListItem, Avatar, ListItemText, Typography, Chip } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder'
import MessageIcon from '@material-ui/icons/Message'
import GroupIcon from '@material-ui/icons/Group'
import { withStyles } from '@material-ui/core/styles'
import { withLocalize, Translate } from 'react-localize-redux'
import localization from './localization.json'
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


class MessageListItem extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        received: PropTypes.bool.isRequired,
        receiverId: PropTypes.string,
        senderId: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        message: PropTypes.string,
        style: PropTypes.object,
        messageId: PropTypes.string.isRequired,
        addTranslation: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        const { addTranslation } = this.props
        addTranslation(localization);
    }

    render() {
        const { classes, style, received, receiverId, senderId, title, message, messageId, openMessage, translate } = this.props;

        return (
            <ListItem style={{ ...style }} button onClick={() => { openMessage(messageId, !received) }}>
                <Avatar className={classes.avatar}>
                    <MessageIcon style={{ height: 32, width: 32 }} />
                </Avatar>
                <ListItemText
                    style={{ flex: 1 }}
                    primary={(
                        <Typography>
                            {received ? translate("sentBy") : translate("messageReceiver")}
                            {received ? senderId : receiverId}
                        </Typography>
                    )}
                    secondary={(
                        <Typography variant="caption" noWrap>
                            {message ? translate("message") + message : translate("credentialTitle") + title}
                        </Typography>
                    )}
                />
            </ListItem>
        )
    }
}

const mapStateToProps = () => ({

})

const mapDispatchToProps = {
    openMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(MessageListItem)))