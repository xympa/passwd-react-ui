import axios from 'axios'
import { getTranslate } from 'react-localize-redux'
import { REST_BASE } from '../AppConfig'
import { networkDecode, networkEncode } from '../EnsoSharedBridge';
import { store } from '../App';

export const parse406Error = (error) => {
    const translate = getTranslate(store.getState().localize)
    if (error.response && error.response.status === 406)
        switch (error.response.data) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                error.message = translate(`validationErrors.credential.${error.response.data}`);
                break;
            default:
            // error.message = translate("validationErrors.default406") + JSON.stringify(error, null, 2);
        }

    return Promise.reject(error);
}

export const requestCredentialInfo = id => (dispatch, getState) => {

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
        .then(response => Promise.resolve({
            ...response.data,
            password: networkDecode(response.data.password)
        }))
        .catch(parse406Error)
}


export const requestCredentialUpdate = (id, belongsTo, credential) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}credential/`;
    return axios(
        {
            url: url,
            method: 'put',
            params: {
                authusername: username,
                sessionkey: sessionKey,

                //Credential params
                id,
                belongsTo,
                title: credential.title,
                username: credential.username,
                description: credential.description,
                password: networkEncode(credential.password),
                url: credential.url
            }
        })
        .catch(parse406Error)
}

export const requestCredentialDeletion = (id) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}credential/`;
    return axios(
        {
            url: url,
            method: 'delete',
            params: {
                authusername: username,
                sessionkey: sessionKey,

                //Credential params
                credentialId: id
            }
        })
        .catch(parse406Error)

}

export const requestCredentialInsertion = (credential, belongsTo) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    if (!belongsTo)
        return Promise.reject({ message: "Attempted to create a credential in root" });

    var url = `${REST_BASE}credential/`;
    return axios(
        {
            url: url,
            method: 'post',
            params: {
                authusername: username,
                sessionkey: sessionKey,

                //Credential params
                belongsTo,
                title: credential.title,
                username: credential.username,
                description: credential.description,
                password: networkEncode(credential.password),
                url: credential.url
            }
        })
        .then(response => Promise.resolve(response.data))
        .catch(parse406Error)

}