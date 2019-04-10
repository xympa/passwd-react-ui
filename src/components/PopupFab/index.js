/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { Fade } from '@material-ui/core'

const styles = theme => ({
    fab: {
        position: 'absolute',
        bottom: theme.spacing.unit * 4,
        right: theme.spacing.unit * 4,
    },
    popupBase: {
        position: 'absolute',
        bottom: theme.spacing.unit * 9,
        right: 8,
    }
})

export class index extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.node),
            PropTypes.node
        ]).isRequired,
        mainFab: PropTypes.node.isRequired

    }

    constructor(props) {
        super(props)

        this.state = {
            poppedUp: false
        }

        this.togglePop = this.togglePop.bind(this)
    }

    togglePop() {
        this.setState(prevState => ({ poppedUp: !prevState.poppedUp }))
    }


    render() {
        const { children, classes, mainFab } = this.props;
        const { poppedUp } = this.state;

        return (
            <div className={classes.fab} onClick={this.togglePop}>
                {mainFab}
                <Fade in={poppedUp} unmountOnExit> 
                    <div className={classes.popupBase}>
                        {
                            children.map(node => (
                                <div key={node.key} style={{ marginTop: 16 }}>
                                    {node}
                                </div>
                            ))
                        }
                    </div>
                </Fade>
            </div>

        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(index))
