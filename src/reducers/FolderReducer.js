import * as types from "../actions/actionTypes";

const INITIAL_STATE = {
    contents: {
        credentials: [],
        folders: [],
        openFolder: null
    },
    path: []
};

const FolderReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case types.FETCHED_FOLDER_CONTENTS:
            console.log("fetched folders")
            return {
                ...state,
                contents: action.payload,
            };
        case types.FETCHED_FOLDER_PATH:
            console.log("fetched folder path")
            return {
                ...state,
                path: action.payload,
            };
        default:
            return state;
    }
};

export default FolderReducer;