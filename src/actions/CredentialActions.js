import axios from 'axios'
import { REST_BASE } from '../constants/rest'
import { CLOSED_CREDENTIAL, FETCHED_CREDENTIAL, OPENED_CREDENTIAL, CREDENTIAL_TOGGLE_EDIT_MODE, CREDENTIAL_SET_FETCHING, CREDENTIAL_BEGIN_CREATION } from './actionTypes'
import { networkDecode, networkEncode } from '../EnsoSharedBridge';
import { fetchFolderContents } from './FolderActions'

export const fetchCredential = (id) => (dispatch, getState) => {

    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}credential/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                credentialId: id
            }
        })
        .then(response => {
            dispatch(setOpenCredentialInfo(response.data));
        })
        .catch(() => { })
};

const setOpenCredentialInfo = info => ({
    type: FETCHED_CREDENTIAL,
    payload: {
        ...info,
        password: networkDecode(info.password)
    }
});

const setOpenCredential = (id) => ({
    type: OPENED_CREDENTIAL,
    payload: id
})

export const openCredential = id => dispatch => {
    dispatch(setOpenCredential(id))
    dispatch(fetchCredential(id))

}

export const closeCredential = () => dispatch => {
    dispatch(({
        type: CLOSED_CREDENTIAL
    }))
}

export const toggleEditMode = () => dispatch => {
    dispatch({
        type: CREDENTIAL_TOGGLE_EDIT_MODE
    })
}

export const setFetching = (bool) => dispatch => {
    dispatch({
        type: CREDENTIAL_SET_FETCHING,
        payload: bool
    })
}

export const beginCredentialCreation = () => dispatch => {
    dispatch({
        type: CREDENTIAL_BEGIN_CREATION
    })
}

export const requestCredentialUpdate = credential => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;
    const { idCredentials, belongsToFolder, } = getState().credential.data

    var url = `${REST_BASE}credential/`;
    return axios(
        {
            url: url,
            method: 'put',
            params: {
                authusername: username,
                sessionkey: sessionKey,

                //Credential params
                id: idCredentials,
                belongsTo: belongsToFolder,
                title: credential.title,
                username: credential.username,
                description: credential.description,
                password: networkEncode(credential.password),
                url: credential.url
            }
        })
}

export const updateCredential = credential => (dispatch, getState) => {
    dispatch({ type: CREDENTIAL_SET_FETCHING, payload: true });

    dispatch(requestCredentialUpdate(credential)).then(() => {
        dispatch(fetchCredential(getState().credential.data.idCredentials))
        dispatch(fetchFolderContents())
    })
}


export const requestCredentialDeletion = () => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;
    const { idCredentials } = getState().credential.data

    var url = `${REST_BASE}credential/`;
    return axios(
        {
            url: url,
            method: 'delete',
            params: {
                authusername: username,
                sessionkey: sessionKey,

                //Credential params
                credentialId: idCredentials
            }
        })
}

export const deleteCredential = () => dispatch => {
    dispatch(requestCredentialDeletion()).then(() => {
        dispatch(closeCredential());
        dispatch(fetchFolderContents())
    })
}

export const requestCredentialInsertion = credential => (dispatch, getState) => {
    console.log(getState())


    const { username, sessionKey } = getState().authentication;
    const belongsToFolder = getState().folder.folderInfo.idFolders

    if(belongsToFolder === null)
        return Promise.reject("Attempted to create a credential in root");

    var url = `${REST_BASE}credential/`;
    return axios(
        {
            url: url,
            method: 'post',
            params: {
                authusername: username,
                sessionkey: sessionKey,

                //Credential params
                belongsTo: belongsToFolder,
                title: credential.title,
                username: credential.username,
                description: credential.description,
                password: networkEncode(credential.password),
                url: credential.url
            }
        })
}

export const insertCredential = credential => (dispatch, getState) => {
    dispatch({ type: CREDENTIAL_SET_FETCHING, payload: true });

    dispatch(requestCredentialInsertion(credential))
    .then((response) => {
        dispatch(openCredential(response.data))
        dispatch(fetchFolderContents())
    })
}