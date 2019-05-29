import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'

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