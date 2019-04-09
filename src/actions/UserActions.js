import axios from 'axios'
import { getTranslate } from 'react-localize-redux'
import { REST_BASE } from '../AppConfig'
import { store } from '../App';

const parse406Error = (error) => {
    const translate = getTranslate(store.getState().localize)
    switch (error.response && error.response.status === 406 && error.response.data) {
        case 1:

            error.message = translate(`validationErrors.message.9`);
            break;
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            error.message = translate(`validationErrors.user.${error.response.data}`);
            break;
        default:
            error.message = translate("validationErrors.default406") + JSON.stringify(error.response.data, null, 2);
    }

    return Promise.reject(error);
}

export const requestUserList = (useSearch = false) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}users/search/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                search: useSearch ? getState().search.value : ''
            }
        })
        .then(response => Promise.resolve(response.data))
        .catch(parse406Error)
}

export const requestUser = usernameToFetch => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}users/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                username: usernameToFetch
            }
        })
        .catch(parse406Error)
}

export const requestUserCreation = user => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}users/`;
    return axios(
        {
            url: url,
            method: "post",
            params: {
                authusername: username,
                sessionkey: sessionKey,

                ...user
            }
        })
        .catch(parse406Error)
}

export const requestUserEdit = user => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}users/`;
    return axios(
        {
            url: url,
            method: "put",
            params: {
                authusername: username,
                sessionkey: sessionKey,

                ...user
            }
        })
        .catch(parse406Error)
}

export const requestUserRemoval = usernameToDelete => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}users/`;
    return axios(
        {
            url: url,
            method: "delete",
            params: {
                authusername: username,
                sessionkey: sessionKey,

                username: usernameToDelete
            }
        })
        .catch(parse406Error)
}