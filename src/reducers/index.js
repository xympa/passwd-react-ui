import { combineReducers } from "redux";
import authenticationReducer from "./AuthenticationReducer";
import FolderReducer from "./FolderReducer";
import SearchReducer from "./SearchReducer";
import CredentialReducer from './CredentialReducer'


export default combineReducers({
   authentication: authenticationReducer,
   folder: FolderReducer,
   search: SearchReducer,
   credential: CredentialReducer
});