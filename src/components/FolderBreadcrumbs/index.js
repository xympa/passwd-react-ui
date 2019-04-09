import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter} from 'react-router-dom'
import { Button } from '@material-ui/core';
import { withLocalize } from 'react-localize-redux';
import RightArrowIcon from '@material-ui/icons/ArrowRight'
import SearchIcon from '@material-ui/icons/Search';
import { withStyles } from '@material-ui/core/styles'
import localization from './localization.json'

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
        translate: PropTypes.func.isRequired,
        addTranslation: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        const { addTranslation } = this.props
        addTranslation(localization)
    }

    render() {

        const { classes, path, search, translate, history } = this.props;

        return (
            <div className={classes.root}>
                {(() => {
                    var iter = 0;
                    return path.map(element => {
                        iter++;
                        return (
                            <div className={classes.breadcrumb} key={element.parent + "-" + element.name}>
                                <Button
                                    disabled={iter === path.length}
                                    onClick={() => {
                                        history.push('/home/' + path[path.length - iter +1].parent) //hehehe flip the array, we're looking at it from the wrong perspective
                                    }}
                                >
                                    {element.name}
                                </Button>
                                {iter !== path.length && <RightArrowIcon />}
                            </div>
                        )
                    })
                })()}
                {
                    search.trim() !== "" && (
                        <Button disabled>
                            <SearchIcon />
                            {translate("lookingFor") + search}
                        </Button>
                    )
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    search: state.search.value
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(withRouter(FolderBreadcrumbs))))