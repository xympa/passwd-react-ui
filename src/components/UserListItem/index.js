import React from 'react'
import PropTypes from 'prop-types'
import { ListItem, Avatar, ListItemText, Typography } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person'
import { withStyles } from '@material-ui/core/styles'
import UserAdminModal from '../UserAdminModal';

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

class UserListItem extends React.Component {

    static propTypes = {
        onRequestRefresh: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            isModalOpen: false,
            hovered: false
        }

        this.closeModal = this.closeModal.bind(this)
        this.openModal = this.openModal.bind(this)
    }

    closeModal() {
        this.setState({
            isModalOpen: false
        })
    }

    openModal() {
        this.setState({
            isModalOpen: true
        })
    }


    render() {
        const { classes, style, user, onRequestRefresh } = this.props;
        const { isModalOpen, hovered } = this.state

        return (
            <div>
                <ListItem
                    style={style}
                    button
                    onClick={this.openModal}
                    selected={hovered}
                    onMouseEnter={() => {this.setState({hovered: true})}}
                    onMouseLeave={() => {this.setState({hovered: false})}}
                >
                    <Avatar className={classes.avatar}>
                        <PersonIcon style={{ height: 32, width: 32 }} />
                    </Avatar>
                    <ListItemText
                        style={{ flex: 1 }}
                        primary={(
                            <Typography>{user.username}</Typography>
                        )}
                        secondary={(
                            <Typography variant="caption" noWrap>
                                {user.email}
                            </Typography>
                        )}
                    />
                </ListItem>
                <UserAdminModal
                    username={user.username}
                    open={isModalOpen}
                    onRequestClose={() => {
                      this.closeModal()
                    }}
                    onRequestRefresh={onRequestRefresh}
                />
            </div>
        )
    }
}

UserListItem.propTypes = {
    classes: PropTypes.object.isRequired,
    style: PropTypes.object,
    user: PropTypes.object.isRequired,
}

export default withStyles(styles)(UserListItem)