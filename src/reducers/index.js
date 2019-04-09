import { combineReducers } from "redux";
import { localizeReducer } from 'react-localize-redux'
import authenticationReducer from "./AuthenticationReducer";
import SearchReducer from "./SearchReducer";
import RootFolderReducer from './RootFolderReducer'
import MessageReducer from './MessageReducer'


export default combineReducers({
   authentication: authenticationReducer,
   search: SearchReducer,
   rootFolders: RootFolderReducer,
   messages: MessageReducer,
   localize: localizeReducer
});