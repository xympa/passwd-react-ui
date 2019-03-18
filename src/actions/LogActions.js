import axios from 'axios'
import { SET_LOG_META, SET_LOG_FETCHING, SET_LOG_LIST, APPEND_LOG_LIST } from './actionTypes';
import { REST_BASE } from '../AppConfig'

const setLogMeta = (meta) => ({
    type: SET_LOG_META,
    payload: meta
})

export const setIsFetching = (bool) => dispatch => new Promise(resolve => {
    dispatch({
        type: SET_LOG_FETCHING,
        payload: bool
    })

    resolve();
}) 

const setLogList = (list) => ({
    type: SET_LOG_LIST,
    payload: list
})
const appendToLogList = (list) => ({
    type: APPEND_LOG_LIST,
    payload: list
})


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
}

export const fetchLogMeta = () => (dispatch, getState) => {
    return dispatch(requestLogMeta())
        .then(({ data }) => {
            dispatch(setLogMeta(data))
        })
}

const requestLogs = (filters) => (dispatch, getState) => {
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
}

export const fetchLogs = (filters) => (dispatch, getState) => {
    return dispatch(requestLogs(filters))
        .then(({ data }) => {
            console.log(filters)
            if (filters.startIndex == 0)
                dispatch(setLogList(data))
            else
                dispatch(appendToLogList(data))
        })
}