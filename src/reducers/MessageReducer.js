import * as types from "../actions/actionTypes";

const INITIAL_STATE = {
    inbox: [],
    outbox: [],
    modal: {
        open: false,
        isFetching: true,
        isEditing: true,
        isCreating: true,
        baseCredentialInfo: null,
        messageInfo: null,
        sendResult: null,
        folderTree: null,
        choosingCredentialLocation: false,
        userList: [],
        readonly: false
    }
}

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {

        case types.SET_INBOX:
            return {
                ...state,
                inbox: action.payload
            }
        case types.SET_OUTBOX:
            return {
                ...state,
                outbox: action.payload
            }
        case types.SET_MESSAGE_MODAL_OPEN:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    open: action.payload
                }
            }
        case types.SET_MESSAGE_MODAL_FETCHING:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    isFetching: action.payload
                }
            }
        case types.SET_MESSAGE_MODAL_EDITING:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    isEditing: action.payload
                }
            }
        case types.SET_BASE_CREDENTIAL_INFO:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    baseCredentialInfo: action.payload
                }
            }
        case types.SET_MESSAGE_INFO:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    messageInfo: action.payload
                }
            }
        case types.SET_MESSAGE_MODAL_USER_LIST:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    userList: action.payload
                }
            }
        case types.SET_MESSAGE_MODAL_CREATING:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    isCreating: action.payload
                }
            }
        case types.SET_SEND_RESULT:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    sendResult: action.payload
                }
            }
        case types.SET_FOLDER_TREE:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    folderTree: action.payload
                }
            }
        case types.CLOSE_MESSAGE_MODAL:
            return {
                ...state,
                modal: INITIAL_STATE.modal
            }
            case types.SET_CHOOSING_CREDENTIAL_LOCATION:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    choosingCredentialLocation: action.payload
                }
            }
                    case types.SET_MESSAGE_MODAL_READ_ONLY:
            return {
                ...state,
                modal: {
                    ...state.modal,
                    readonly: action.payload
                }
            }
        default:
            return state
    }
}
