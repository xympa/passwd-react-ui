import axios from 'axios'
import { REST_BASE } from '../AppConfig'
import { USER_ADMIN_SET_USER_LIST, USER_ADMIN_SET_FETCHING } from './actionTypes';

const setUserList = list => ({
    type: USER_ADMIN_SET_USER_LIST,
    payload: list
})

const setIsFetching = bool => ({
    type: USER_ADMIN_SET_FETCHING,
    payload: bool
})

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
}

export const requestUser = () => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}users/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                username: username
            }
        })
}

export const fetchUserList = () => (dispatch) => new Promise(resolve => {
    dispatch(setIsFetching(true))

    dispatch(requestUserList())
        .then(({ data }) => {
            dispatch(setUserList(data))

            dispatch(setIsFetching(false))
            resolve()
        })
})