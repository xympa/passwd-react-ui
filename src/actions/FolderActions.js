import axios from 'axios'
import { networkDecode } from '../EnsoSharedBridge';
import { REST_BASE } from '../AppConfig'
import { FETCHED_FOLDER_CONTENTS, FETCHED_FOLDER_PATH, OPEN_FOLDER, FINISHED_FETCHING_FOLDER, FETCHED_FOLDER_INFO, STARTED_FETCHING_FOLDER } from './actionTypes'
import { setRootFolders } from './RootFolderActions';

const parse406Error = (error) => {
    switch (error.response && error.response.status === 406 && error.response.data) {
        case 1:
            error.message = "Já existe uma pasta com esse nome.";
            break;
        case 2:
            error.message = "O nome é um atributo obrigatório.";
            break;
        case 3:
            error.message = "Tentou atribuir permissões a um utilizador inexistente.";
            break;
        default:
            error.message = "406 com resposta " + JSON.stringify(error.response.data, null, 2);
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
        .catch(parse406Error)

}

export const fetchFolderContents = () => (dispatch, getState) => {
    const { username, sessionKey } = getState().authentication;
    const search = getState().search.value;
    const { openId } = getState().folder

    var url = `${REST_BASE}folders/`;

    return axios(
        {
            url: url,
            method: 'get',
            params: {
                authusername: username,
                sessionkey: sessionKey,
                folderId: openId,
                search: search
            }
        })
        .then(response => {
            return new Promise(resolve => {
                if (response.data.search === getState().search.value) {
                    dispatch(updateFolderContents({
                        ...response.data,
                        credentials: response.data.credentials.map(cred => ({ ...cred, password: networkDecode(cred.password) }))
                    }));

                    if (openId === null)
                        dispatch(setRootFolders(response.data.folders));

                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
        .catch(() => { })
}

export const fetchRootFolders = () => (dispatch, getState) => {
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
        .then(response => {
            return new Promise(resolve => {
                    dispatch(updateFolderContents({
                        folders: response.data,
                        credentials: []
                    }));

                    resolve(true)
            })
        })
        .catch(() => { })
}

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
};

export const fetchFolderInfo = (id) => (dispatch, getState) => {


    if (getState().folder.openId == null && !id)
        return new Promise(resolve => {
            dispatch(updateFolderInfo({
                folderInfo: {
                    idFolders: null
                },
                permissions: []
            }))
            resolve();
        })

    const { username, sessionKey } = getState().authentication;

    if (!id)
        id = getState().folder.openId
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

export const finishFetchingFolder = () => ({
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
        if (didUpdateContents)
            dispatch(finishFetchingFolder())
    })
}

export const openFolder = folderId => dispatch => {
    dispatch(setOpenfolder(folderId))
    dispatch(startFetchingFolder())

    return Promise
        .all([
            dispatch(fetchFolderContents()),
            dispatch(fetchFolderPath()).then(response => {
                dispatch(updateFolderPath(response.data));
                return Promise.resolve()
            }),
            dispatch(fetchFolderInfo()).then(response => {
                if (response) dispatch(updateFolderInfo(response.data));
                return Promise.resolve()
            })
        ])
        .then(() => {
            console.log("all good")
            dispatch(finishFetchingFolder());
        })
        .catch((error) => {
            console.log("ooops ", error)
        })
}

export const fetchAdministrationFolders = () => (dispatch) => {
    dispatch(startFetchingFolder())

    return dispatch(fetchRootFolders()).then(() => {
        dispatch(finishFetchingFolder());
    })


}