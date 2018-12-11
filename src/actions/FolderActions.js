import axios from 'axios'
import { REST_BASE } from '../constants/rest'
import { FETCHED_FOLDER_CONTENTS, FETCHED_FOLDER_PATH } from './actionTypes'

export const fetchFolderContents = (folderId) => (dispatch, getState) => {

    const { username, sessionKey } = getState().authentication;
    const search = getState().search.value;

    var url = `${REST_BASE}folders/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                folderId: folderId,
                search: search
            }
        })
        .then(response => {
            if (response.data.search === getState().search.value)
                dispatch(updateFolderContents(response.data));
        })
        .catch(() => { })
};

export const fetchFolderPath = (folderId) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}folder/getPath/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                folderId: folderId,
            }
        })
        .then(response => {
            dispatch(updateFolderPath(response.data));
        })
        .catch(() => { })
};

const updateFolderContents = contents => ({
    type: FETCHED_FOLDER_CONTENTS,
    payload: contents
});

const updateFolderPath = path => ({
    type: FETCHED_FOLDER_PATH,
    payload: path
});

export const openFolder = folderId => dispatch => {
    dispatch(fetchFolderContents(folderId))
    dispatch(fetchFolderPath(folderId));
}