import * as types from "../actions/actionTypes";

const INITIAL_STATE = {
    openFolder: null,
    data: {
        folderInfo: null,
        permissions: []
    },
    permissions: [],
    userList: [],
    isEditing: false,
    isCreating: false,
    isFetching: false,
    parentFolder: null
};

const CredentialReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case types.ADMIN_FOLDER_FETCHED:
            console.log("fetched folder");
            return {
                ...state,
                data: action.payload,
            };
        case types.ADMIN_FOLDER_USER_LIST_FETCHED:
            console.log("fetched folder");
            return {
                ...state,
                userList: action.payload,
            };
        case types.SET_ADMIN_FOLDER:
            console.log("open ", action.payload);
            return {
                ...state,
                openFolder: action.payload,
                isFetching: true,
                isEditing: false,
                isCreating: false
            };
        case types.FOLDER_ADMIN_SET_EDIT_MODE:
            return {
                ...state,
                isEditing: action.payload
            };
        case types.FOLDER_ADMIN_SET_FETCHING:
            console.log("set fetching ", action.payload);
            return {
                ...state,
                isFetching: action.payload
            };
        case types.FOLDER_BEGIN_CREATION:
            console.log("begin creating folder");
            return {
                ...INITIAL_STATE,
                isCreating: true,
                isEditing: true,
                parentFolder: action.payload
            };
        case types.CLOSED_FOLDER_ADMIN:
            console.log("closed fodler");
            return INITIAL_STATE;
        default:
            return state;
    }
};

export default CredentialReducer