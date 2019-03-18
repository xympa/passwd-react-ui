import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import FolderIcon from '@material-ui/icons/Folder'
import { openFolder } from '../../actions/FolderActions'
import HighlightableListItem from '../HighlightableListItem';

const RootFolderListItem = (props) => {

    const { className, id, name, history } = props;

    return (
        <HighlightableListItem
            onClick={() => { history.push('/home/' + id); }}
            className={className}
        >
            <ListItemIcon><FolderIcon color="primary" /></ListItemIcon>
            <ListItemText primary={<Typography noWrap variant="body2">{name}</Typography>} />
        </HighlightableListItem>
    )
}

RootFolderListItem.propTypes = {
    name: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
    history: PropTypes.object.isRequired,
    className: PropTypes.string,
}

export default withStyles({})(withRouter(RootFolderListItem))