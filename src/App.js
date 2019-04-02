import React from 'react';
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { persistStore, persistReducer } from 'redux-persist';
import { CookieStorage } from 'redux-persist-cookie-storage';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import Cookies from 'cookies-js';
import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import { Provider } from "react-redux";
import { SnackbarProvider } from 'notistack';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import MomentUtils from '@date-io/moment'
import axios from 'axios'
// eslint-disable-next-line import/no-named-as-default
import MainSwitch from './components/MainSwitch';
import reducers from './reducers';
import { useHashRouter } from './AppConfig'
import { LocalizeProvider, getTranslate } from 'react-localize-redux';
import { Tooltip } from '@material-ui/core';


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

axios.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, (error) => {
    // Do something with response error
    console.log("INTERCEPTED AN ERROR RESPONSE", store.getState())
    const translate = getTranslate(store.getState().localize)
    if (error.response) {
        switch (error.response.status) {
            case 401:
            case 403:
            case 404:
            case 406:
            case 500:
                error.message = translate(`serverErrors.${error.response.status}`)
                break;
            default:
                error.message = translate("serverErrors.default") + error.response.status;
                break;
        }
    }
    else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        error.message = translate("serverErrors.conenctionCut")
    }

    return Promise.reject(error);
});

const Router = useHashRouter ? HashRouter : BrowserRouter;

const App = () => (
    <MuiThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <SnackbarProvider maxSnack={3}>
                <Provider store={store}>
                    <LocalizeProvider store={store}>
                        <PersistGate loading={(<div>LoadingState</div>)} persistor={persistor}>
                            <Router>
                                <MainSwitch />
                            </Router>
                        </PersistGate>
                    </LocalizeProvider>

                </Provider>
            </SnackbarProvider>
        </MuiPickersUtilsProvider>
    </MuiThemeProvider>
)


export default App