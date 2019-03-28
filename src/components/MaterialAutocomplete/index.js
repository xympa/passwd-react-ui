import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles'

import classNames from 'classnames';
import Select from 'react-select';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import CancelIcon from '@material-ui/icons/Cancel';
import { emphasize } from '@material-ui/core/styles/colorManipulator';

const styles = theme => ({
    root: {
        flexGrow: 1,
        flex: 0
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
    chip: {
        margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
    },
    chipFocused: {
        backgroundColor: emphasize(
            theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
            0.08,
        ),
    },
    noOptionsMessage: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: 'absolute',
        left: 2,
        fontSize: 16,
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
    },
    divider: {
        height: theme.spacing.unit * 2,
    }
})

function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
}

function Control(props) {

    return (
        <TextField
            fullWidth
            InputLabelProps={{
                shrink: !!props.selectProps.value || props.menuIsOpen
            }}
            label={props.selectProps.placeholder}
            InputProps={{
                inputComponent,
                inputProps: {
                    className: props.selectProps.classes.input,
                    inputRef: props.innerRef,
                    children: props.children,
                    ...props.innerProps,
                },
            }}
        // {...props.selectProps.textFieldProps}
        />
    );
}

function Option(props) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
        >
            {props.children}
        </MenuItem>
    );
}

function Placeholder(props) {
    return null;
}

function SingleValue(props) {

    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer(props) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function MultiValue(props) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            className={classNames(props.selectProps.classes.chip, {
                [props.selectProps.classes.chipFocused]: props.isFocused,
            })}
            onDelete={props.removeProps.onClick}
            deleteIcon={<CancelIcon {...props.removeProps} />}
        />
    );
}

function Menu(props) {
    return (
        <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
            {props.children}
        </Paper>
    );
}

const components = {
    Control,
    Menu,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
    DropdownIndicator: null
};



class MaterialAutocomplete extends React.Component {

    static propTypes = {
        classes: PropTypes.object.isRequired,
        suggestions: PropTypes.array.isRequired,
        onSuggestionAccepted: PropTypes.func,
        placeholder: PropTypes.string,
        value: PropTypes.any,
        disabled: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            single: null
        }

        this.handleChangeSingle = this.handleChangeSingle.bind(this)
    }

    handleChangeSingle(newValue) {
        const { onSuggestionAccepted, value } = this.props;
        this.setState({
            single: !value ? null : newValue
        }, () => {
            if (onSuggestionAccepted) onSuggestionAccepted(newValue)
        });
    }

    render() {
        const { classes, suggestions, placeholder, disabled } = this.props
        const { single } = this.state



        const selectStyles = {
            input: base => ({
                ...base,
                // color: theme.palette.text.primary,
                '& input': {
                    font: 'inherit',
                },

            }),
        };

        return (
            <div className={classes.root}>
                <Select
                    classes={classes}
                    styles={selectStyles}
                    options={suggestions}
                    components={components}
                    value={single}
                    onChange={this.handleChangeSingle}
                    placeholder={placeholder}
                    isDisabled={disabled}
                />
            </div>
        );
    }

}

export default withStyles(styles)(MaterialAutocomplete);