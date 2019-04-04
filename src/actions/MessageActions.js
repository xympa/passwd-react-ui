import axios from 'axios'
import { getTranslate } from 'react-localize-redux'
import {
    SET_INBOX, SET_MESSAGE_MODAL_OPEN, SET_MESSAGE_MODAL_FETCHING, SET_BASE_CREDENTIAL_INFO, SET_OUTBOX,
    SET_MESSAGE_MODAL_EDITING, SET_MESSAGE_MODAL_USER_LIST, SET_MESSAGE_MODAL_CREATING, SET_MESSAGE_INFO, SET_SEND_RESULT,
    SET_FOLDER_TREE, CLOSE_MESSAGE_MODAL, SET_CHOOSING_CREDENTIAL_LOCATION, SET_MESSAGE_MODAL_READ_ONLY
} from './actionTypes'
import { REST_BASE } from '../AppConfig'
import { requestCredentialInfo } from './CredentialActions'
import { requestUserList } from './UserActions'
import { networkEncode, networkDecode } from '../EnsoSharedBridge'
import { store } from '../App';


const parse406Error = (error) => {
    const translate = getTranslate(store.getState().localize)

    switch (error.response && error.response.status === 406 && error.response.data) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            error.message = translate(`validationErrors.credential.${error.response.data}`);
            break;
        case 6:
        case 7:
        case 8:
        case 9:
            error.message = translate(`validationErrors.credential.${error.response.data}`);
            break;
        default:
            error.message = translate("validationErrors.default406") + JSON.stringify(error.response.data, null, 2);
    }

    return Promise.reject(error);
}

export const getFrontServerPath = () => {
    return window.location.protocol + "//" +
        window.location.hostname +
        window.location.pathname.slice(0, -1) +
        (window.location.port.length > 0 ? (":" + window.location.port) : "") +
        "/#/externalMessage/"
}

export const requestInbox = () => (dispatch, getState) => {

    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}inbox/`;

    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
            }
        })
}

export const requestOutbox = () => (dispatch, getState) => {

    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}outbox/`;

    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
            }
        })
}

const requestInternalMessageSubmission = (credential, message) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    const credentialParams = typeof credential === 'object' ?
        {
            title: credential.title,
            username: credential.username,
            description: credential.description,
            password: networkEncode(credential.password),
            url: credential.url,
        } : {
            referencedCredential: credential,
        }

    var url = `${REST_BASE}share/`;
    return axios(
        {
            url: url,
            method: 'post',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                //Credential Params
                ...credentialParams,
                //Message Params
                receiver: message.receiver.target,
                message: message.message,
                timeToDie: message.timeToDie,
            }
        })
        .catch(parse406Error)
}

const requestExternalMessageSubmission = (credential, message) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    const credentialParams = typeof credential === 'object' ?
        {
            title: credential.title,
            username: credential.username,
            description: credential.description,
            password: networkEncode(credential.password),
            url: credential.url,
        } : {
            referencedCredential: credential,
        }

    var url = `${REST_BASE}shareExternal/`;
    return axios(
        {
            url: url,
            method: 'post',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                //Credential Params
                ...credentialParams,
                //Message Params
                receiver: message.receiver.target,
                message: message.message,
                timeToDie: message.timeToDie,
                serverpath: getFrontServerPath()
            }
        })
        .catch(parse406Error)
}

const requestMessageInfo = id => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}message/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                //Credential Params
                messageId: id
            }
        })
        .catch(parse406Error)
}


const requestFolderTree = () => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}folderTreeView/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
            }
        })
        .catch(parse406Error)
}

const requestSaveMessage = (messageId, credential, targetFolder) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}message/`;
    return axios(
        {
            url: url,
            method: 'post',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                //Credential params
                title: credential.title,
                username: credential.username,
                description: credential.description,
                password: networkEncode(credential.password),
                url: credential.url,
                belongsTo: targetFolder,
                messageId
            }
        })
        .catch(parse406Error)
}

const setInbox = list => ({
    type: SET_INBOX,
    payload: list
})

const setOutbox = list => ({
    type: SET_OUTBOX,
    payload: list
})

const setEditing = list => ({
    type: SET_MESSAGE_MODAL_EDITING,
    payload: list
})

export const fetchInbox = () => dispatch => {
    return dispatch(requestInbox())
        .then(({ data }) => new Promise(resolve => {
            dispatch(setInbox(data));
            resolve();
        }))
}

export const fetchOutbox = () => dispatch => {
    return dispatch(requestOutbox())
        .then(({ data }) => new Promise(resolve => {
            dispatch(setOutbox(data));
            resolve();
        }))
}

const setOpen = bool => ({
    type: SET_MESSAGE_MODAL_OPEN,
    payload: bool
})

export const setFetching = bool => dispatch => new Promise(resolve => {
    dispatch({
        type: SET_MESSAGE_MODAL_FETCHING,
        payload: bool
    })
    resolve()
})

const setBaseCredentialInfo = info => ({
    type: SET_BASE_CREDENTIAL_INFO,
    payload: {
        ...info,
        password: networkDecode(info.password)
    }
})

const setUserList = list => ({
    type: SET_MESSAGE_MODAL_USER_LIST,
    payload: list
})

const setCreating = bool => ({
    type: SET_MESSAGE_MODAL_CREATING,
    payload: bool
})

const setMessageInfo = info => ({
    type: SET_MESSAGE_INFO,
    payload: info
})

const setSendResult = result => ({
    type: SET_SEND_RESULT,
    payload: result
})

const setFolderTree = tree => ({
    type: SET_FOLDER_TREE,
    payload: tree
})

export const closeModal = () => ({
    type: CLOSE_MESSAGE_MODAL
})

const setChoosingCredentialLocation = bool => ({
    type: SET_CHOOSING_CREDENTIAL_LOCATION,
    payload: bool
})

const setReadonly = bool => ({
    type: SET_MESSAGE_MODAL_READ_ONLY,
    payload: bool
})

export const openMessage = (id, readonly = false) => dispatch => {
    dispatch(setFetching(true))
    dispatch(setEditing(!readonly))
    dispatch(setCreating(false))
    dispatch(setReadonly(readonly))
    dispatch(setOpen(true))

    return Promise.all([
        dispatch(requestMessageInfo(id)).then(({ data }) => {
            dispatch(setMessageInfo(data))
            dispatch(setBaseCredentialInfo(data))
        }),
        dispatch(requestFolderTree()).then(({ data }) => {
            dispatch(setFolderTree(data))
        })
    ])
        .then(() => {
            dispatch(setFetching(false))
        })
}

export const composeMessage = (baseCredential = null) => dispatch => {
    dispatch(setFetching(true))
    dispatch(setEditing(true))
    dispatch(setCreating(true))
    dispatch(setMessageInfo(null))
    dispatch(setReadonly(false))
    dispatch(setOpen(true))

    return dispatch(requestUserList())
        .then(({ data }) => {
            dispatch(setUserList(data))

            if (baseCredential)
                return dispatch(requestCredentialInfo(baseCredential))
                    .then(({ data }) => {
                        dispatch(setBaseCredentialInfo(data))
                        dispatch(setFetching(false))
                    })
            else {
                dispatch(setFetching(false)) // ensure
                return Promise.resolve();
            }
        })
}

const sendInternalMessage = (credential, message) => dispatch => {
    dispatch(setFetching(true))
    return dispatch(requestInternalMessageSubmission(credential, message))
        .then(() => {
            dispatch(setFetching(false))
            dispatch(fetchOutbox())
            dispatch(closeModal())
        })
}

const sendExternalMessage = (credential, message) => dispatch => {
    dispatch(setFetching(true))
    return dispatch(requestExternalMessageSubmission(credential, message))
        .then(({ data }) => {
            dispatch(setSendResult(data))
            dispatch(setFetching(false))
            dispatch(fetchOutbox())
        })
}

export const sendMessage = (credential, message) => dispatch => {
    if (message.receiver.isExternal)
        return dispatch(sendExternalMessage(credential, message))
    else
        return dispatch(sendInternalMessage(credential, message))
}

export const moveToCredentialLocationStep = () => dispatch => {
    dispatch(setChoosingCredentialLocation(true));
    return Promise.resolve();
}

export const saveCredential = (messageId, credential, targetFolder) => dispatch => {
    dispatch(setFetching(true));
    return dispatch(requestSaveMessage(messageId, credential, targetFolder))
        .then(() => {
            dispatch(fetchInbox())
                .then(() => {
                    dispatch(closeModal())
                })
        })
}