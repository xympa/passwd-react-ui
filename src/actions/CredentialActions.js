import axios from 'axios'
import { REST_BASE } from '../constants/rest'
import { CLOSED_CREDENTIAL, FETCHED_CREDENTIAL, OPENED_CREDENTIAL, CREDENTIAL_TOGGLE_EDIT_MODE, CREDENTIAL_SET_FETCHING, UPDATING_CREDENTIAL } from './actionTypes'
import { networkDecode, networkEncode } from '../EnsoSharedBridge';
import { fetchFolderContents } from './FolderActions'
import { dispatch } from 'rxjs/internal/observable/pairs';

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
        .then(response => {
    
        })
        .catch(() => { })
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
        .then(response => {

        })
        .catch(() => { })
}

export const deleteCredential = () => dispatch => {
    dispatch(requestCredentialDeletion()).then(() => {
        dispatch(closeCredential());
        dispatch(fetchFolderContents())
    })
}