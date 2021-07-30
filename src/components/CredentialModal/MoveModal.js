import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Dialog, DialogContent, DialogActions, Button  } from '@material-ui/core'
import {connect} from 'react-redux';
import {
    requestFolderTree,
    setFolderTree,
} from '../../actions/MessageActions';
import {
    parse406Error
} from '../../actions/CredentialActions';

import Tree from 'react-animated-tree';
import {Radio } from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import {Translate, withLocalize } from 'react-localize-redux';
import axios from 'axios';
import { REST_BASE } from '../../AppConfig';
import {withSnackbar} from 'notistack';


const styles = (theme) => ({
    margin: {
        margin: theme.spacing.unit,
    },
    textField: {
        flex: '1 1 100%',
        alignSelf: 'stretch',
    },
    leftMargin: {
        marginLeft: theme.spacing.unit,
    },
    timeToDieRoot: {
        // flex: "0 1 40%"
        flex: 1,
    },
    isExternalRoot: {
        // flex: "0 1 33%"
        flex: 1,
    },
    unsetDimensions: {
        padding: 0,
    },
    emailInput: {
        flex: 1,
    },
});


 class MoveModal extends PureComponent {
    static propTypes = {
        visible: PropTypes.bool,
        credentialId: PropTypes.number,
        currentFolder: PropTypes.number
    }

    constructor(props){
        super(props);

        this.state = {
            targetFolder: null
        }

        this.moveCredential = this.moveCredential.bind(this)
    }

    componentWillMount() {

        const {requestFolderTree,setFolderTree } = this.props;

        requestFolderTree().then(({ data }) => {
            setFolderTree(data)
        })
    }

    renderFolderTree(node, inital = false) {
        if (!node) return null;
        const {classes, currentFolder} = this.props;
        const {targetFolder} = this.state;

        if (inital)
            return (
                <Tree content="/" open>
                      {node.length > 0
                        ? node.map((folder) =>
                              this.renderFolderTree(folder),
                          )
                        : null}
                </Tree>
            );
        else
            return (
                <Tree
                    open
                    key={node.id}
                    content={node.name}
                    type={
                        node.id != currentFolder &&
                        <Radio
                            checked={targetFolder === node.id}
                            onChange={(e, checked) => {
                                if (checked)
                                    this.setState({targetFolder: node.id});
                            }}
                            value={node.id}
                            name="radio-button-demo"
                            aria-label={node.name}
                            classes={{
                                root: classes.unsetDimensions,
                            }}
                        />
                    }>
                    {node.childFolders.length > 0
                        ? node.childFolders.map((folder) =>
                              this.renderFolderTree(folder),
                          )
                        : null}
                </Tree>
            );
    }

    moveCredential(){

        const {username, sessionKey} = this.props.authentication;
        const {history, credentialId, enqueueSnackbar, translate} = this.props;

        axios.post(`${REST_BASE}/credential/move/`, {
            authusername: username,
            sessionkey: sessionKey,
            newParent: this.state.targetFolder,
            id: credentialId
        }).then(() =>{
            history.push(`/home/${this.state.targetFolder || ''}`);
            enqueueSnackbar(translate('movedSuccessfully'), {
                variant: "success"
            })
        }).catch(parse406Error)
        .catch((error) => {
            enqueueSnackbar(error.message, {
                variant: "error"
            })
        })
    }
    
    render() {

        const {visible, folderTree, cancel} = this.props;

        return (
           <Dialog open={visible}
           maxWidth="lg"
           fullWidth>
                <DialogContent>
                {this.renderFolderTree(folderTree, true)}

                    </DialogContent>
                    <DialogActions>
                    <Button
                                variant="contained"
                                onClick={cancel}>
                                <Translate id="cancel" />
                            </Button>
                            <div style={{flex:1}} />
                            <Button
                                variant="contained"
                                onClick={this.moveCredential}>
                                <Translate id="move" />
                            </Button>
                        </DialogActions>

           </Dialog>
        )
    }
}

const mapStateToProps = (state) => ({
    folderTree: state.messages.modal.folderTree,
    authentication: state.authentication
});

const mapDispatchToProps = {
    requestFolderTree,
    setFolderTree,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(styles)(withSnackbar(withLocalize(MoveModal))))