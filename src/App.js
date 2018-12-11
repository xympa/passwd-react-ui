import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { persistStore, persistReducer } from 'redux-persist';
import { CookieStorage } from 'redux-persist-cookie-storage';
import Cookies from 'cookies-js';
import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import { Provider } from "react-redux";
import reducers from './reducers';
import { SnackbarProvider } from 'notistack';
import MainSwitch from './components/MainSwitch';
import { BrowserRouter } from 'react-router-dom';
import autoMergeLevel1 from 'redux-persist/es/stateReconciler/autoMergeLevel1';
import hardSet from 'redux-persist/es/stateReconciler/hardSet';


const theme = createMuiTheme({
    "palette":
    {
        "common":
        {
            "black": "#000",
            "white": "#fff"
        },
        "background":
        {
            "paper": "#fff",
            "default": "#fafafa"
        },
        "primary":
        {
            "light": "rgba(95, 120, 133, 1)",
            "main": "rgba(19, 56, 73, 1)",
            "dark": "rgba(21, 51, 68, 1)",
            "contrastText": "#fff"
        }, "secondary":
        {
            "light": "#ff4081", "main": "rgba(255, 93, 38, 1)",
            "dark": "#c51162", "contrastText": "#fff"
        },
        "error":
        {
            "light": "#e57373",
            "main": "rgba(208, 2, 27, 1)",
            "dark": "#d32f2f",
            "contrastText": "#fff"
        },
        "text":
        {
            "primary": "rgba(0, 0, 0, 0.87)",
            "secondary": "rgba(0, 0, 0, 0.54)",
            "disabled": "rgba(0, 0, 0, 0.38)",
            "hint": "rgba(0, 0, 0, 0.38)"
        }
    },
    typography: {
        useNextVariants: true,
    },
});


// Cookies.defaults.domain = ...

const persistConfig = {
    key: "root",
    storage: new CookieStorage(Cookies/*, options */),
    stateReconciler: autoMergeLevel2,
    whitelist: ['authentication']
}

const pReducer = persistReducer(persistConfig, reducers);

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(pReducer);

export const persistor = persistStore(store);

document.body.style.margin = 0;

class App extends Component {
    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <SnackbarProvider maxSnack={3}>
                    <Provider store={store}>
                        <PersistGate loading={(<div>LoadingState</div>)} persistor={persistor}>
                            <BrowserRouter>
                                <MainSwitch />
                            </BrowserRouter>
                        </PersistGate>
                    </Provider>
                </SnackbarProvider>
            </MuiThemeProvider >
        );
    }
}



export default App;
