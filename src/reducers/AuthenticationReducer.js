import * as types from "../actions/actionTypes"

const INITIAL_STATE = {
    username: undefined,
    sessionKey: undefined,
    actions: undefined,
    validity: false
};

const AuthReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case types.PERFORM_LOGIN:
        console.log("loggedin")
            return {
                ...state,
                validity: action.payload.isValid,
                username: action.payload.username,
                sessionKey: action.payload.sessionKey,
                actions: action.payload.actions
            };
        case types.CHECK_AUTH:
            console.log("checked auth");
            return {
                ...state, validity: action.payload
            };
        case types.LOGOUT:
            console.log("logout");
            return {
                ...INITIAL_STATE
            };
        default:
            return state;
    }
};

export default AuthReducer