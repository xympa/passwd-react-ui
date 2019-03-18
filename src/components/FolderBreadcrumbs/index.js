import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button } from '@material-ui/core';
import RightArrowIcon from '@material-ui/icons/ArrowRight'
import SearchIcon from '@material-ui/icons/Search';

import { withStyles } from '@material-ui/core/styles'


const styles = () => ({
    root: {
        flex: 1,
        display: "flex"
    },
    breadcrumb: {
        alignItems: "center",
        display: "flex"
    }
})

export class FolderBreadcrumbs extends Component {
    static propTypes = {
        path: PropTypes.arrayOf(PropTypes.shape({
            parent: PropTypes.number,
            name: PropTypes.string.isRequired
        })).isRequired,
        classes: PropTypes.object.isRequired,
        search: PropTypes.string.isRequired,
    }

    render() {

        const { classes, path, search } = this.props;

        return (
            <div className={classes.root}>
                {(() => {
                    var iter = 0;
                    return path.map(element => {
                        iter++;
                        return (
                            <div className={classes.breadcrumb} key={element.parent + "-" + element.name}>
                                <Button disabled={iter === path.length}>{element.name}</Button>
                                {iter !== path.length && <RightArrowIcon />}
                            </div>)
                    })
                })()}
                {
                    search.trim() !== "" && (
                        <Button disabled>
                            <SearchIcon />
                            {`Looking for: "${search}"`}
                        </Button>
                    )
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    path: state.folder.path,
    search: state.search.value
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FolderBreadcrumbs))
