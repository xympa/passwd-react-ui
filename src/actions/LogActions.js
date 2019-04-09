import axios from 'axios'
import { REST_BASE } from '../AppConfig'

export const requestLogMeta = () => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}logFilters/`;

    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
            }
        })
        .then(response => Promise.resolve(response.data))
}

export const requestLogs = (filters) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;
    const search = getState().search.value;

    var url = `${REST_BASE}logs/`;

    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                search,
                ...filters,
            }
        })
        .then(response => Promise.resolve(response.data))
}