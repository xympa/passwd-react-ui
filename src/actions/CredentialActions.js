import axios from 'axios'
import { REST_BASE } from '../constants/rest'
import { CLOSED_CREDENTIAL, FETCHED_CREDENTIAL, OPENED_CREDENTIAL, CREDENTIAL_TOGGLE_EDIT_MODE, CREDENTIAL_SET_FETCHING, CREDENTIAL_BEGIN_CREATION } from './actionTypes'
import { networkDecode, networkEncode } from '../EnsoSharedBridge';
import { fetchFolderContents } from './FolderActions'

const parse406Error = (error) => {
    switch (error.response && error.response.status === 406 && error.response.data) {
        case 1:
            error.message = "O url é inválido";
            break;
        case 2:
            error.message = "O titulo é inválido";
            break;
        case 3:
            error.message = "Já existe uma credencial com esse titulo";
            break;
        case 4:
            error.message = "A password é obrigatória";
            break;
        case 5:
            error.message = "O servidor não reconhece a pasta onde está a tentar criar a credencial";
            break;
    }

    return Promise.reject(error);
}

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
        .catch(parse406Error)
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
    return dispatch(fetchCredential(id))

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

const requestCredentialUpdate = credential => (dispatch, getState) => {
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
        .catch(parse406Error)

}

export const updateCredential = credential => (dispatch, getState) => {
    dispatch({ type: CREDENTIAL_SET_FETCHING, payload: true });

    return dispatch(requestCredentialUpdate(credential)).then(() => {
        return Promise.all([
            dispatch(fetchCredential(getState().credential.data.idCredentials)),
            dispatch(fetchFolderContents())
        ])
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
        .catch(parse406Error)

}

export const deleteCredential = () => dispatch => {
    return dispatch(requestCredentialDeletion()).then(() => {
        dispatch(closeCredential());
        return dispatch(fetchFolderContents())
    })
}

export const requestCredentialInsertion = credential => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;
    const belongsToFolder = getState().folder.folderInfo.idFolders

    if (belongsToFolder === null)
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
        .catch(parse406Error)

}

export const insertCredential = credential => dispatch => {
    dispatch({ type: CREDENTIAL_SET_FETCHING, payload: true });

    return dispatch(requestCredentialInsertion(credential))
        .then((response) => {
            return Promise.all([
                dispatch(openCredential(response.data)),
                dispatch(fetchFolderContents())
            ])
        })
}