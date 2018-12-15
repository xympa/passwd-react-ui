import * as types from "../actions/actionTypes";

const INITIAL_STATE = {
    openCredential: null,
    data: null,
    fetchingCredential: false,
    isEditing: false,
    isCreating: false
};

const CredentialReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case types.FETCHED_CREDENTIAL:
            console.log("fetched credential");
            return {
                ...state,
                data: action.payload,
                fetchingCredential: false,
                isEditing: false,
                isCreating: false
            };
        case types.OPENED_CREDENTIAL:
            console.log("open credential", action.payload);
            return {
                ...state,
                openCredential: action.payload,
                fetchingCredential: true,
                isEditing: false,
                isCreating: false
            };
        case types.CREDENTIAL_TOGGLE_EDIT_MODE:
            console.log("toggle mdoe");
            return {
                ...state,
                isEditing: !state.isEditing
            };
        case types.CREDENTIAL_SET_FETCHING:
            console.log("set fetching ", action.payload);
            return {
                ...state,
                fetchingCredential: action.payload
            };
        case types.CREDENTIAL_BEGIN_CREATION:
            console.log("begin creating credential");
            return {
                ...INITIAL_STATE,
                isCreating: true,
                isEditing: true
            };
        case types.CLOSED_CREDENTIAL:
            console.log("closed credential");
            return INITIAL_STATE;
        default:
            return state;
    }
};

export default CredentialReducer