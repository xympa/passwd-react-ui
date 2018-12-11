import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ListItem, Avatar, ListItemText, Typography, Chip } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock'
import GroupIcon from '@material-ui/icons/Group'
import { withStyles } from '@material-ui/core/styles'
import { openCredential } from '../../actions/CredentialActions'

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

const CredentialListItem = (props) => {
    const { classes, credential, style, openCredential } = props;


    return (
        <ListItem style={{ ...style }} button onClick={() => { openCredential(credential.idCredentials) }}>
            <Avatar className={classes.avatar}>
                <LockIcon style={{ height: 32, width: 32 }} />
            </Avatar>
            <ListItemText
                style={{ flex: 1 }}
                primary={<Typography>{credential.title}</Typography>}
                secondary={<Typography variant="caption" noWrap>{credential.description}</Typography>}
            />
            <div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
                <Chip className={classes.margin} avatar={<Avatar><GroupIcon color="primary" /></Avatar>} label={"Criada por " + credential.createdById} />
            </div>
        </ListItem>
    )
}

CredentialListItem.propTypes = {
    classes: PropTypes.object.isRequired,
    credential: PropTypes.object.isRequired,
    style: PropTypes.object,
    openCredential: PropTypes.func.isRequired
};

const mapStateToProps = () => ({

})

const mapDispatchToProps = {
    openCredential
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CredentialListItem))