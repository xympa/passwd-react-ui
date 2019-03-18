import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames'
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { NoSsr } from '@material-ui/core';

const styles = theme => ({
    root: {
        width: "100%",
        alignItems: "center",
        display: "flex",
    },
    input: {
        display: 'flex',
        padding: 0,
    },
    valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden',
    },
    noOptionsMessage: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: 'absolute',
        fontSize: 16,
        top: -1
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
        top: 56
    },
    divider: {
        height: theme.spacing.unit * 2,
    },
});

function NoOptionsMessage(props) {
    const { selectProps, innerProps, children } = props;
    return (
        <Typography
            color="textSecondary"
            className={selectProps.classes.noOptionsMessage}
            {...innerProps}
        >
            {children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
}

function Control(props) {
    const { selectProps, innerProps, children, innerRef } = props;

    return (
        <TextField
            fullWidth
            disabled={selectProps.disabled}
            InputProps={{
                inputComponent,
                inputProps: {
                    className: selectProps.classes.input,
                    inputRef: innerRef,
                    children: children,
                    ...innerProps,
                },
            }}
            {...selectProps.textFieldProps}
        />
    );
}

function Option(props) {
    const { isFocused, innerProps, children, innerRef, isSelected } = props;
    return (
        <MenuItem
            buttonRef={innerRef}
            selected={isFocused}
            component="div"
            style={{
                fontWeight: isSelected ? 500 : 400,
            }}
            {...innerProps}
        >
            {children}
        </MenuItem>
    );
}

function Placeholder(props) {
    const { selectProps, innerProps, children } = props;
    return (
        <Typography
            color="textSecondary"
            component="label"
            className={selectProps.classes.placeholder}
            {...innerProps}
            style={{letterSpacing: "unset"}}
        >
            {children}
        </Typography>
    );
}

function SingleValue(props) {
    const { selectProps, innerProps, children } = props;
    return (
        <Typography className={selectProps.classes.singleValue} {...innerProps}>
            {children}
        </Typography>
    );
}

function ValueContainer(props) {
    const { selectProps, children } = props;
    return (
        <div className={selectProps.classes.valueContainer}>
            {children}
        </div>
    );
}

function Menu(props) {
    const { selectProps, innerProps, children } = props;
    return (
        <Paper square className={selectProps.classes.paper} {...innerProps}>
            {children}
        </Paper>
    );
}

function IndicatorsContainer(){
    return (<span />)
}

const components = {
    Control,
    Menu,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
    IndicatorsContainer
};

class UserAutocomplete extends React.Component {

    static propTypes = {
        classes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        suggestions: PropTypes.array.isRequired,
        onAutocomplete: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            username: null
        }
    }

    handleChange = name => ({ value }) => {
        const { onAutocomplete } = this.props
        this.setState({
            [name]: value,
        });

        onAutocomplete(value)
    };

    render() {
        const { classes, theme, suggestions, className, placeholder, disabled } = this.props;
        const { username } = this.state;

        const selectStyles = {
            input: base => ({
                ...base,
                color: theme.palette.text.primary,
                '& input': {
                    font: 'inherit',
                },
            }),
        };

        return (
            <NoSsr>
                <Select
                    className={classNames(classes.root, className )}
                    classes={classes}
                    styles={selectStyles}
                    options={suggestions}
                    components={components}
                    value={username}
                    onChange={this.handleChange('username')}
                    placeholder={placeholder || "Escolha um utilizador..."}
                    disabled={disabled}
                />
            </NoSsr>
        );
    }
}

export default withStyles(styles, { withTheme: true })(UserAutocomplete);