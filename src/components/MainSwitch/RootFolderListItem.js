import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import FolderIcon from '@material-ui/icons/Folder'
import HighlightableListItem from '../HighlightableListItem';

const RootFolderListItem = (props) => {

    const { className, id, name, style } = props;

    return (
        <Link to={'/home/' + id}>
            <HighlightableListItem
                className={className}
                style={style}
            >
                <ListItemIcon><FolderIcon color="primary" /></ListItemIcon>
                <ListItemText primary={<Typography noWrap variant="body2">{name}</Typography>} />
            </HighlightableListItem>
        </Link>
    )
}

RootFolderListItem.propTypes = {
    name: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
    className: PropTypes.string,
}

export default withStyles({})(RootFolderListItem)