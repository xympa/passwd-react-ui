import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Grow from '@material-ui/core/Grow';
import Button from '@material-ui/core/Button';
import { Fab, Select } from '@material-ui/core'
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import AccountIcon from '@material-ui/icons/Person';
import MenuIcon from '@material-ui/icons/Menu';
import { withLocalize } from 'react-localize-redux'

import { logout } from '../../actions/AuthenticationActions'
import { changeSearch } from '../../actions/SearchActions'

const styles = theme => ({
    root: {
        width: '100%',
        zIndex: 1300,
    },
    appBarPaper: {
        height: 64
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    title: {
        display: 'none',
        height: 24,
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing.unit * 2,
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing.unit * 3,
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing.unit * 9,
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        paddingTop: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingLeft: theme.spacing.unit * 10,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: 200,
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    fab: {
        margin: theme.spacing.unit,
    },
    extendedIcon: {
        marginRight: theme.spacing.unit,
    },
});

export class Header extends Component {
    static propTypes = {
        username: PropTypes.string,
        changeSearch: PropTypes.func.isRequired,
        search: PropTypes.string,
        classes: PropTypes.object.isRequired,
        logout: PropTypes.func.isRequired,
        onMenuClick: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            accountMenuShowing: false
        }

        this._searchChanged = _.debounce(this._searchChanged.bind(this), 30);
        this.handleSearchChange = this.handleSearchChange.bind(this)
        this._handleClose = this._handleClose.bind(this)
    }

    handleSearchChange(event) {
        event.persist();
        this._searchChanged(event);
    }

    _searchChanged(event) {
        const { changeSearch } = this.props;
        changeSearch(event.target.value);
    }

    _handleClose() {
        this.setState(prevState => ({
            accountMenuShowing: !prevState.accountMenuShowing
        }))
    }

    render() {
        const { classes, search, onMenuClick, username, logout, activeLanguage, languages, setActiveLanguage } = this.props;
        const { accountMenuShowing } = this.state

        return (
            <div className={classes.root}>
                <AppBar
                    position="static"
                    classes={{
                        root: classes.appBarPaper
                    }}
                >
                    <Toolbar>
                        <div className={classes.sectionMobile}>
                            <IconButton aria-haspopup="true" onClick={onMenuClick} color="inherit">
                                <MenuIcon />
                            </IconButton>
                        </div>
                        <img className={classes.title} src={require('../../assets/logo-branco.png')} alt="enso logo branco" />
                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                <SearchIcon />
                            </div>
                            <InputBase
                                placeholder="Procurar ..."
                                value={search}
                                onChange={this.handleSearchChange}
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                            />
                        </div>
                        <div className={classes.grow} />
                        <div className={classes.sectionDesktop} />
                        <Button
                            className={classes.fab}
                            buttonRef={ref => { this._anchorEl = ref }}
                            onClick={() => { this.setState(prevState => ({ accountMenuShowing: !prevState.accountMenuShowing })) }}
                        >
                            <AccountIcon style={{ color: "white", marginRight: "1em" }} />
                            <Typography style={{ color: "white", textTransform: "capitalize" }}>Hi {username}!</Typography>
                        </Button>
                        <Popper open={accountMenuShowing} placement="bottom-end" anchorEl={this._anchorEl} transition disablePortal>
                            {({ TransitionProps }) => (
                                <Grow
                                    {...TransitionProps}
                                    id="menu-list-grow"
                                    style={{ transformOrigin: 'right top' }}
                                >
                                    <Paper>
                                        <ClickAwayListener onClickAway={this._handleClose}>
                                            <MenuList>
                                                <MenuItem onClick={this._handleClose}>My account</MenuItem>
                                                <MenuItem>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="age-simple">Language</InputLabel>
                                                        <Select
                                                            value={activeLanguage.code}
                                                            onChange={(event) => { setActiveLanguage(event.target.value) }}
                                                            inputProps={{
                                                                name: 'lang',
                                                                id: 'lang',
                                                            }}
                                                        >
                                                            {
                                                                languages.map(lang => (
                                                                    <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
                                                                ))
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </MenuItem>
                                                <MenuItem onClick={logout}>
                                                    Logout
                                                </MenuItem>
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

const mapDispatchToProps = {
    logout,
    changeSearch
}

const mapStateToProps = state => ({
    username: state.authentication.username
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withLocalize(Header)))