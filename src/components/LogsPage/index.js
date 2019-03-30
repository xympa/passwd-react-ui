import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { DateTimePicker } from "material-ui-pickers";
import moment from 'moment'
import { Fade, CircularProgress, Divider } from '@material-ui/core'
import MUIDataTable from 'mui-datatables'
import { withLocalize, Translate } from 'react-localize-redux'
import localization from './localization.json'
import { replaceSearchAction, removeSearchAction } from '../../actions/SearchActions'
import { measureElement } from '../../Utils'
import { fetchLogMeta, fetchLogs } from '../../actions/LogActions';

const fetchPerRequest = 20


const styles = theme => ({
    header: {
        display: "flex",
        height: 64,
        paddingLeft: 64,
        paddingRight: 64,
        justifyContent: "space-between",
        alignItems: "center"
    },
    formControl: {
        flex: 1,
        marginLeft: theme.spacing.unit * 4,
        marginRight: theme.spacing.unit * 4,
    },
    table: {
        fontFamily: theme.typography.fontFamily,
    },
    flexContainer: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
    },
    tableRow: {
        cursor: 'pointer',
    },
    tableRowHover: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    tableCell: {
        flex: 1,
    },
    noClick: {
        cursor: 'initial',
    },

});



export class LogsPage extends Component {
    static propTypes = {
        list: PropTypes.array.isRequired,
        fetchLogMeta: PropTypes.func.isRequired,
        removeSearchAction: PropTypes.func.isRequired,
        replaceSearchAction: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        addTranslation: PropTypes.func.isRequired,
        translate:PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            isFetching: true,
            error: undefined,
            width: window.innerWidth,
            height: window.innerHeight,
            filters: {
                category: '',
                initDate: moment().subtract(7, 'days'),
                finalDate: moment(),
                username: ''
            },
            hasNextPage: true,
            isNextPageLoading: false,
        }


        this.reloadViewContents = this.reloadViewContents.bind(this)
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)

        const { addTranslation}= this.props
        addTranslation(localization)
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        // replaceSearchAction()
        this.reloadViewContents()

    }

    componentWillUnmount() {
        const { removeSearchAction } = this.props;
        removeSearchAction();
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: measureElement(this).width, height: window.innerHeight });
    }

    reloadViewContents(resolve) {
        const { fetchLogMeta, fetchLogs } = this.props;


        this.setState({ isFetching: true }, () => {
            const { filters } = this.state;
            Promise.all([
                fetchLogMeta(),
                fetchLogs({
                    startIndex: 0,
                    username: filters.username,
                    facility: filters.facility,
                    startTime: filters.initDate.unix(),
                    endTime: filters.finalDate.unix(),
                    advance: fetchPerRequest
                })
            ])
                .catch(error => {
                    this.setState({
                        error: error
                    });
                })
                .then(() => {
                    this.setState({
                        isFetching: false
                    }, () => {
                        this._hookUpOnScrollEvent()
                    })
                })
                .then(resolve)
        })
    }

    _hookUpOnScrollEvent() {

        // hook up onScroll event

        const children = this._footerRef.parentElement.parentElement.children
        children[2].addEventListener('scroll', (event) => {
            var element = event.target;
            if (element.scrollHeight - element.scrollTop === element.clientHeight) {
                this.fetchNextPage();
            }
        })
    }

    fetchNextPage() {
        const { isNextPageLoading, hasNextPage } = this.state
        if (isNextPageLoading || !hasNextPage)
            return;

        this.setState({
            isNextPageLoading: true
        }, () => {
            const { fetchLogs, list } = this.props
            const { filters } = this.state
            fetchLogs({
                startIndex: list.size,
                username: filters.username,
                facility: filters.facility,
                startTime: filters.initDate.unix(),
                endTime: filters.finalDate.unix(),
                advance: fetchPerRequest
            })
                .catch(error => {
                    this.setState({
                        error: error
                    });
                })
                .then(() => {
                    this.setState({
                        isNextPageLoading: false
                    })
                })
        })

    }



    render() {

        const { isFetching, error, width, height, filters, hasNextPage, isNextPageLoading } = this.state;

        const { classes, meta, list, translate } = this.props

        const myTheme = createMuiTheme({
            overrides: {
                MUIDataTable: {
                    responsiveScroll: {
                        maxHeight: height - 194 - (filters.username || filters.category || filters.severity_level ? 40 : 0) //Chips are shown?
                    }
                }
            }
        });

        return (
            <div>
                <div style={{ flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    {!meta && (
                        <Fade in>
                            <div className={classes.header}>
                                <CircularProgress />
                            </div>
                        </Fade>
                    )}
                    {meta && (
                        [
                            <Fade key="loader" in={isFetching || isNextPageLoading}>
                                <div style={{ height: height - 64, width: width, position: "absolute", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <CircularProgress />
                                </div>
                            </Fade>,
                            <Fade key="table" in={!isFetching && !isNextPageLoading}>
                                <div>
                                    <MuiThemeProvider theme={myTheme}>
                                        <MUIDataTable
                                            title="Logs"
                                            data={list}
                                            columns={[
                                                {
                                                    label: translate('insertedDate'),
                                                    name: 'inserted_timestamp',
                                                    options: {
                                                        filter: false
                                                    }
                                                },
                                                {
                                                    label: translate("facility"),
                                                    name: 'facility',
                                                    options: {
                                                        filterOptions: meta.facilities
                                                    }
                                                },

                                                {
                                                    label: translate("severity"),
                                                    name: 'severity_level',
                                                    options: {
                                                        filterOptions: meta.severities
                                                    }
                                                },
                                                {
                                                    label: translate("action"),
                                                    name: 'action',
                                                    options: {
                                                        filter: false
                                                    }
                                                },
                                                {
                                                    label: translate("username"),
                                                    name: 'ownerid',
                                                    options: {
                                                        filterOptions: meta.users,
                                                        filterType: 'checkbox'
                                                    }
                                                },
                                            ]}
                                            options={{
                                                responsive: "scroll",
                                                serverSide: true,
                                                pagination: false,
                                                search: false,
                                                selectableRows: false,
                                                onTableChange: (action, state) => {
                                                    switch (action) {
                                                        case 'resetFilters':
                                                        case 'filterChange':
                                                            {
                                                                let obj = {};

                                                                state.filterList.forEach((array, index) => {

                                                                    let actualFilter;

                                                                    switch (state.columns[index].name) {
                                                                        case 'ownerid':
                                                                            actualFilter = 'username'
                                                                            break;
                                                                        case 'facility':
                                                                            actualFilter = 'category'
                                                                            break;
                                                                        case 'severity_level':
                                                                            actualFilter = state.columns[index].name
                                                                            break;
                                                                        default:
                                                                            return;
                                                                    }

                                                                    obj[actualFilter] = array.length === 0 ? undefined : array[0]
                                                                })

                                                                this.setState(prevState => ({
                                                                    filters: {
                                                                        ...prevState.filters,
                                                                        ...obj
                                                                    }
                                                                }), this.reloadViewContents);
                                                                break;
                                                            }
                                                        default:
                                                            break;
                                                    }
                                                },
                                                customFooter: () => (

                                                    <div style={{ height: 64, display: "flex", flexDirection: "column" }} ref={ref => { this._footerRef = ref }}>
                                                        <Divider />
                                                        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                                                            <DateTimePicker
                                                                ampm={false}
                                                                className={classes.formControl}
                                                                value={filters.initDate}
                                                                onChange={newMoment => {
                                                                    this.setState(prevState => ({
                                                                        filters: {
                                                                            ...prevState.filters,
                                                                            initDate: newMoment
                                                                        }
                                                                    }), this.reloadViewContents)
                                                                }}
                                                                label={translate("initialDate")}
                                                            />
                                                            <DateTimePicker
                                                                ampm={false}
                                                                className={classes.formControl}
                                                                value={filters.finalDate}
                                                                onChange={newMoment => {
                                                                    this.setState(prevState => ({
                                                                        filters: {
                                                                            ...prevState.filters,
                                                                            finalDate: newMoment
                                                                        }
                                                                    }), this.reloadViewContents)
                                                                }}
                                                                label={translate("finalDate")}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            }}

                                        />
                                    </MuiThemeProvider>
                                </div>
                            </Fade>
                        ]
                    )}


                    <Divider />

                </div>
            </div>
        )
    }

}

const mapStateToProps = (state) => ({
    meta: state.log.meta,
    list: state.log.list
    .map(log => ({
        ...log,
        "inserted_timestamp": moment(new Date(log.inserted_timestamp * 1000)).toString(),
        // "severity_level": meta.severities.find(s => s) translate severity to string, but this is php lib hardcoded which sucks
    })),
})


const mapDispatchToProps = {
    fetchLogMeta,
    removeSearchAction,
    replaceSearchAction,
    fetchLogs
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(LogsPage)))
