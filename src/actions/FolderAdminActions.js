import { SET_ADMIN_FOLDER, ADMIN_FOLDER_FETCHED, CLOSED_FOLDER_ADMIN, ADMIN_FOLDER_USER_LIST_FETCHED, FOLDER_ADMIN_SET_FETCHING, FOLDER_ADMIN_SET_EDIT_MODE, FOLDER_BEGIN_CREATION } from './actionTypes'
import { fetchFolderInfo, requestFolderUpdate, requestFolderCreation, updateContents, goToParent, requestFolderDeletion } from './FolderActions'
import { requestUserList } from './UserActions'

const setAdminFolder = (id) => ({
    type: SET_ADMIN_FOLDER,
    payload: id
})

const closeFolderAdmin = () => ({
    type: CLOSED_FOLDER_ADMIN
})

const adminFolderFetched = info => ({
    type: ADMIN_FOLDER_FETCHED,
    payload: info
})

const adminUserListFetched = info => ({
    type: ADMIN_FOLDER_USER_LIST_FETCHED,
    payload: info
})

const folderAdminSetFetching = bool => ({
    type: FOLDER_ADMIN_SET_FETCHING,
    payload: bool
})

const folderAdminSetEditMode = bool => ({
    type: FOLDER_ADMIN_SET_EDIT_MODE,
    payload: bool
})

const folderBeginCreation = (parent) => ({
    type: FOLDER_BEGIN_CREATION,
    payload: parent
})


export const setFetching = (bool) => dispatch => {
    dispatch(folderAdminSetFetching(bool))
}

export const deleteFolder = () => (dispatch, getState) => {
    const { idFolders } = getState().folderAdmin.data.folderInfo

    dispatch(folderAdminSetFetching(true));

    return dispatch(requestFolderDeletion(idFolders)).then(() => {
        dispatch(closeFolderAdmin());
        dispatch(goToParent());
    })
}

export const updateFolder = (folder, permissions) => (dispatch, getState) => {
    const { idFolders } = getState().folderAdmin.data.folderInfo

    dispatch(folderAdminSetFetching(true));

    return dispatch(requestFolderUpdate({ ...folder, id: idFolders }, permissions)).then(() => {
        dispatch(fetchFolderInfo(getState().folderAdmin.openFolder))
            .then(() => {
                dispatch(folderAdminSetFetching(false));
                dispatch(folderAdminSetEditMode(false));
            })
    })
}

export const createFolder = (folder, permissions) => (dispatch, getState) => {
    dispatch(folderAdminSetFetching(true));

    return dispatch(requestFolderCreation({ ...folder, parent: getState().folderAdmin.parentFolder }, permissions)).then(() => {
        dispatch(updateContents())
        dispatch(closeFolderAdmin())
    })
}

export const adminFolder = (id) => (dispatch, getState) => {
    if (!id)
        id = getState().folder.openId;

    dispatch(setAdminFolder(id))
    dispatch(folderAdminSetFetching(true))
    Promise.all([
        dispatch(fetchFolderInfo(id))
            .then(response => {
                console.log(response)
                return new Promise(resolve => { dispatch(adminFolderFetched(response.data)); resolve(); })
            }),
        dispatch(requestUserList())
            .then(response => {
                return new Promise(resolve => { dispatch(adminUserListFetched(response.data)); resolve(); })
            })
    ])
        .then(() => {
            dispatch(folderAdminSetFetching(false))
            console.log(getState())

        })
}

export const beginCreation = (parent = null) => (dispatch, getState) => {
    dispatch(folderBeginCreation(parent))
    dispatch(folderAdminSetFetching(true))
    Promise.all([
        dispatch(fetchFolderInfo(parent))
            .then(response => {
                if (response)
                    return new Promise(resolve => { response.data.folderInfo = undefined; dispatch(adminFolderFetched(response.data)); resolve(); })
            }),
        dispatch(requestUserList())
            .then(response => {
                return new Promise(resolve => { dispatch(adminUserListFetched(response.data)); resolve(); })
            })
    ]
    ).then(() => {
        dispatch(folderAdminSetFetching(false))
        console.log(getState())
    })
}

export const closeAdmin = () => dispatch => {
    dispatch(closeFolderAdmin())
}

export const toggleEditMode = () => (dispatch, getState) => {
    dispatch(folderAdminSetEditMode(!getState().folderAdmin.isEditing))
}