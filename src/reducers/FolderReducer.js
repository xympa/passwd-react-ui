import * as types from "../actions/actionTypes";

const INITIAL_STATE = {
    contents: {
        credentials: [],
        folders: [],
    },
    path: [],
    openId: null,
    folderInfo: null,
    permissions: [],
    isFetching: false,
};

const FolderReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case types.FETCHED_FOLDER_CONTENTS:
            return {
                ...state,
                contents: action.payload,
            };
        case types.FETCHED_FOLDER_PATH:
            return {
                ...state,
                path: action.payload,
            };
        case types.OPEN_FOLDER:
            return {
                ...state,
                openId: action.payload,
            }
        case types.FETCHED_FOLDER_INFO:
            return {
                ...state,
                ...action.payload
            }
        case types.FINISHED_FETCHING_FOLDER:
            return {
                ...state,
                isFetching: false
            }
        case types.STARTED_FETCHING_FOLDER:
            return {
                ...state,
                isFetching: true
            }
        default:
            return state;
    }
};

export default FolderReducer;