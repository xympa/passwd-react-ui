import { combineReducers } from "redux";
import { localizeReducer } from 'react-localize-redux'
import authenticationReducer from "./AuthenticationReducer";
import FolderReducer from "./FolderReducer";
import SearchReducer from "./SearchReducer";
import CredentialReducer from './CredentialReducer'
import FolderAdminReducer from './FolderAdminReducer'
import RootFolderReducer from './RootFolderReducer'
import MessageReducer from './MessageReducer'
import LogReducer from "./LogReducer";
import UserReducer from "./UserReducer";


export default combineReducers({
   authentication: authenticationReducer,
   folder: FolderReducer,
   search: SearchReducer,
   credential: CredentialReducer,
   folderAdmin: FolderAdminReducer,
   rootFolders: RootFolderReducer,
   messages: MessageReducer,
   log: LogReducer,
   user: UserReducer,
   localize: localizeReducer
});