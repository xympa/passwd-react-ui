import * as types from "../actions/actionTypes";

const INITIAL_STATE = {
    list: [],
    isFetching: false,
    meta: null
}

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {

        case types.APPEND_LOG_LIST:
            return {
                ...state,
                list: [
                    ...state.list,
                    ...action.payload
                ]
            }
        case types.SET_LOG_LIST:
            return {
                ...state,
                list: action.payload
            }
        case types.SET_LOG_META:
            return {
                ...state,
                meta: action.payload
            }
        case types.SET_LOG_FETCHING:
            return {
                ...state,
                isFetching: action.payload
            }
        default:
            return state
    }
}
