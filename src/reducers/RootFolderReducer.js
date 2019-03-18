import * as types from "../actions/actionTypes";

const INITIAL_STATE = {
    list: []
};

const RootFolderReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case types.SET_ROOT_FOLDERS:
            return {
                ...state,
                list: action.payload,
            };
        default:
            return state;
    }
};

export default RootFolderReducer;