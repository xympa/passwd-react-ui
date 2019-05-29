import React, { Component } from 'react'
import Popover from '@material-ui/core/Popover'

export default class ContextMenu extends Component {

    constructor(props) {
        super(props)

        this.state = {
            top: 0,
            left: 0,
            showing: false
        }

        this.showContext = this.showContext.bind(this)
    }

    showContext(e) {
        e.preventDefault()
        e.persist()
        this.setState({
            showing: false
        }, () => {
            this.setState({
                top: e.pageY,
                left: e.pageX,
                showing: true
            })
        })
    }



    render() {
        const { children, items } = this.props
        const { left, top, showing } = this.state

        return (
            <div onContextMenu={this.showContext}>
                {children}
                    <Popover
                        anchorReference="anchorPosition"
                        anchorPosition={{ top, left }}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        open={showing}
                        onBackdropClick={(e) => {
                            e.stopPropagation()
                            this.setState({
                                showing: false
                            })
                        }}
                    >
                        {items}
                    </Popover>
            </div>
        )
    }
}
