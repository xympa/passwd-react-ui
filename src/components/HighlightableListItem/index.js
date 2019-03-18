import React, { Children } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import FolderIcon from '@material-ui/icons/Folder'
import { openFolder } from '../../actions/FolderActions'

class HighlightableListItem extends React.Component {
    static propTypes = {
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.node),
            PropTypes.node
        ]).isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            hovered: false
        }
    }

    render() {
        const { hovered } = this.state;

        return (
            <ListItem
                button
                selected={hovered}
                onMouseEnter={() => { this.setState({ hovered: true }) }}
                onMouseLeave={() => { this.setState({ hovered: false }) }}
                {...this.props}
            >
                {this.props.children}
            </ListItem>
        )
    }
}

export default withStyles({})(HighlightableListItem)