import React from 'react'
import PropTypes from 'prop-types'
import { ListItem, Avatar, ListItemText, Typography, Chip } from '@material-ui/core';
import { Textfit } from 'react-textfit'
import FolderIcon from '@material-ui/icons/Folder'
import KeyIcon from '@material-ui/icons/VpnKey'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import LogsIcon from '@material-ui/icons/ListAlt'
import { measureElement } from '../../Utils';


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




class SizeReporter extends React.Component {

    componentDidMount = () => {
        if (this._element) {
            this.props.onMeasure(measureElement(this._element));
        }

    }



    render() {
        return (
            <div ref={ref => { this._element = ref }}>
                {this.props.children}
            </div>
        )
    }

}

class LogListItem extends React.Component {

    static propTypes = {
        classes: PropTypes.object.isRequired,
        log: PropTypes.object.isRequired,
        onClick: PropTypes.func,
        style: PropTypes.object
    }


    render() {
        const { classes, log, style, onClick, reportMeasurement, facilitySize } = this.props;

        return (
            <ListItem style={{ ...style }} button onClick={onClick}>
                <Avatar className={classes.avatar}>
                    <LogsIcon />
                </Avatar>
                <SizeReporter onMeasure={reportMeasurement}>
                    <Typography style={(facilitySize > 0 ? { width: facilitySize } : {})} variant="h4">{log.facility}</Typography>
                </SizeReporter>
                <ListItemText
                    style={{ flex: 1 }}
                    primary={<Typography>{log.action}</Typography>}
                    secondary={<Typography variant="caption" noWrap>{`${log.ownerid}`}</Typography>}
                />
            </ListItem>
        )
    }
}

export default withStyles(styles)(LogListItem)