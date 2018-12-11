import * as types from "../actions/actionTypes";

const INITIAL_STATE = {
    value: "",
    action: undefined
};

const FolderReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case types.SEARCH_CHANGED:
            return {
                ...state,
                value: action.payload,
            };
        case types.REPLACED_SEARCH_ACTION:
            return {
                ...state,
                action: action.payload,
            };
        case types.REMOVED_SEARCH_ACTION:
            return {
                ...state,
                action: undefined,
            };
        default:
            return state;
    }
};

export default FolderReducer;