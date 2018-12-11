import { SEARCH_CHANGED, REPLACED_SEARCH_ACTION, REMOVED_SEARCH_ACTION } from './actionTypes'

export const changeSearch = (value) => (dispatch, getState) => {

    dispatch({ type: SEARCH_CHANGED, payload: value });

    if (getState().search.action)
        getState().search.action()
};

export const replaceSearchAction = (func) => dispatch => dispatch({ type: REPLACED_SEARCH_ACTION, payload: func });

export const removeSearchAction = () => dispatch => dispatch({ type: REMOVED_SEARCH_ACTION, payload: undefined });
