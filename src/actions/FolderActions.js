import axios from 'axios'
import { getTranslate } from 'react-localize-redux';
import { networkDecode } from '../EnsoSharedBridge';
import { REST_BASE } from '../AppConfig'
import { setRootFolders } from './RootFolderActions'
import { store } from '../App';

const parse406Error = (error) => {
    console.log(store.getState())
    const translate = getTranslate(store.getState().localize)
    switch (error.response && error.response.status === 406 && error.response.data) {
        case 1:
        case 2:
        case 3:
            error.message = translate(`validationErrors.folder.${error.response.data}`)
            break;
        default:
            error.message = translate("validationErrors.default406") + JSON.stringify(error.response.data, null, 2);
    }

    return Promise.reject(error);
}

export const requestFolderDeletion = id => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}folder/`;
    return axios(
        {
            url: url,
            method: 'delete',
            data: {
                authusername: username,
                sessionkey: sessionKey,
                folderId: id,
            }
        })
        .then(response => new Promise(resolve => {
            dispatch(requestFolderContents()) // Deleting a folder might cause a repopulation of the drawer folders, fetchRootFolders
            resolve(response.data) // pass request data along
        }))
        .catch(parse406Error)
}


export const requestFolderUpdate = (folder, permissions) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}folder/`;
    return axios(
        {
            url: url,
            method: 'put',
            data: {
                authusername: username,
                sessionkey: sessionKey,

                //Credential params
                folderId: folder.id,
                name: folder.name,
                parent: (folder.parent ? folder.parent : null),
                permissions: permissions
            }
        })
        .then(response => new Promise(resolve => {
            dispatch(requestFolderContents()) //A change in folder permissions might cause a repopulation of the drawer folders, fetchRootFolders
            resolve(response.data) // pass request data along
        }))
        .catch(parse406Error)

}

export const requestFolderCreation = (folder, permissions) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}folder/`;
    return axios(
        {
            url: url,
            method: 'POST',
            data: {
                authusername: username,
                sessionkey: sessionKey,

                //Credential params
                name: folder.name,
                folderId: folder.parent,
                permissions: permissions
            }
        })
        .then(response => new Promise(resolve => {
            if (!folder.parent)
                dispatch(requestFolderContents()) // Root folder created, cause a repopulation of the drawer folders, fetchRootFolders
            resolve(response.data) // pass request data along
        }))
        .catch(parse406Error)
}

export const requestFolderContents = (id) => (dispatch, getState) => {
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
                folderId: id,
                search: search
            }
        })
        .then(response => {
            return new Promise(resolve => {
                if (response.data.search === getState().search.value) {

                    const cleanContents = {
                        ...response.data,
                        // folders: response.data.folders,
                        credentials: response.data.credentials.map(cred => ({ ...cred, password: networkDecode(cred.password) }))
                    }

                    if (!id && response.data.search === "")
                        dispatch(setRootFolders(cleanContents.folders));

                    resolve(cleanContents)
                } else {
                    resolve(null)
                }
            })
        })
        .catch(parse406Error)
}

export const requestRootFolders = () => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;
    const search = getState().search.value;

    var url = `${REST_BASE}sysadmin/folders/`;

    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                search: search
            }
        })
        .then(response => Promise.resolve(response.data))
        .catch(parse406Error)
}

export const requestFolderPath = (folderId) => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}folder/getPath/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                folderId,
            }
        })
        .then(response => response.data)
        .catch(parse406Error)
};

export const requestFolderInfo = (id) => (dispatch, getState) => {
    if (!id)
        return new Promise(resolve => {
            const mockFolder = {
                folderInfo: {
                    idFolders: null
                },
                permissions: []
            }
            resolve(mockFolder);
        })

    const { username, sessionKey } = getState().authentication;

    var url = `${REST_BASE}folder/`;
    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                folderId: id,
            }
        })
        .then(response => response.data)
        .catch(parse406Error)
}