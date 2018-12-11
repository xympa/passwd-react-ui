import axios from 'axios'
import { REST_BASE } from '../constants/rest'
import { CHECK_AUTH, PERFORM_LOGIN, LOGOUT } from './actionTypes'

export const checkAuthValidity = (username, sessionkey) => dispatch => {
    if (!username || !sessionkey)
        return dispatch({ type: CHECK_AUTH, payload: false });

    var url = `${REST_BASE}validity/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionkey
            }
        })
        .then(() => { dispatch({ type: CHECK_AUTH, payload: true }) })
        .catch(() => { dispatch({ type: CHECK_AUTH, payload: false }) })
};

export const performLogin = (username, password) => dispatch => {

    var payload = {
        isValid: false,
        username: username,
        sessionKey: undefined,
        actions: undefined
    };

    if (!username || !password)
        return new Promise((resolve, reject) => {
            dispatch({
                type: PERFORM_LOGIN,
                payload: payload
            });

            reject()
        });

    var url = `${REST_BASE}auth/`;
    return axios(
        {
            url: url,
            method: 'post',
            data: {
                username: username,
                password: password
            }
        })
        .then(response => {

            payload.actions = response.data.actions
            payload.sessionKey = response.data.sessionkey
            payload.isValid = true

            return new Promise(resolve => {
                dispatch({
                    type: PERFORM_LOGIN, payload: payload
                })

                resolve();
            });
        })
        .catch(() => {
            return new Promise((resolve, reject) => {
                dispatch({
                    type: PERFORM_LOGIN, payload: payload
                });

                reject();
            });
        })
};

export const logout = () => dispatch => {
    return dispatch({
        type: LOGOUT
    })
}