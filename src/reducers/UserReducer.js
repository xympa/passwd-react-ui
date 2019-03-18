import * as types from "../actions/actionTypes";

const INITIAL_STATE = {
    list: [],
    isFetching: false,
};

const UserReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case types.USER_ADMIN_SET_FETCHING:
            return {
                ...state,
                isFetching: action.payload,
            };
        case types.USER_ADMIN_SET_USER_LIST:
            return {
                ...state,
                list: action.payload,
            };
        default:
            return state;
    }
};

export default UserReducer;