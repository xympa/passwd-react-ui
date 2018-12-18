import axios from 'axios'
import { networkDecode, networkEncode } from '../EnsoSharedBridge';
import { REST_BASE } from '../constants/rest'
import { FETCHED_FOLDER_CONTENTS, FETCHED_FOLDER_PATH, OPEN_FOLDER, FINISHED_FETCHING_FOLDER, FETCHED_FOLDER_INFO, STARTED_FETCHING_FOLDER } from './actionTypes'

export const fetchFolderContents = () => (dispatch, getState) => {

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
                folderId: getState().folder.openId,
                search: search
            }
        })
        .then(response => {

            return new Promise(resolve => {
                if (response.data.search === getState().search.value) {
                    dispatch(updateFolderContents({
                        ...response.data,
                        credentials: response.data.credentials.map(cred => ({...cred, password: networkDecode(cred.password)}))
                    }));
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
        .catch(() => { })
};

export const fetchFolderPath = () => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}folder/getPath/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                folderId: getState().folder.openId,
            }
        })
        .then(response => {
            dispatch(updateFolderPath(response.data));
        })
        .catch(() => { })
};

export const fetchFolderInfo = () => (dispatch, getState) => {

    if (getState().folder.openId == null) {
        return dispatch(updateFolderInfo({
            folderInfo: {
                idFolders: null
            },
            permissions: []
        }))
    }
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}folder/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                folderId: getState().folder.openId,
            }
        })
        .then(response => {
            dispatch(updateFolderInfo(response.data));
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

export const setOpenfolder = id => ({
    type: OPEN_FOLDER,
    payload: id
})

export const finshFetchingFolder = () => ({
    type: FINISHED_FETCHING_FOLDER,
})

export const updateFolderInfo = info => ({
    type: FETCHED_FOLDER_INFO,
    payload: info
})

export const startFetchingFolder = () => ({
    type: STARTED_FETCHING_FOLDER
})

export const goToParent = () => (dispatch, getState) => {
    const { folderInfo, openId } = getState().folder;

    if (openId != null)
        dispatch(openFolder(folderInfo.parent))
}

export const updateContents = () => dispatch => {
    dispatch(startFetchingFolder())

    dispatch(fetchFolderContents()).then(didUpdateContents => {
        if(didUpdateContents)
            dispatch(finshFetchingFolder())
    })
}

export const openFolder = folderId => dispatch => {
    dispatch(setOpenfolder(folderId))

    Promise
        .all([dispatch(fetchFolderContents()), dispatch(fetchFolderPath()), dispatch(fetchFolderInfo())])
        .then(() => {
            dispatch(finshFetchingFolder());
        });
}