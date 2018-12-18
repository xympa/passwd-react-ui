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
import { SnackbarProvider, withSnackbar } from 'notistack';
import MainSwitch from './components/MainSwitch';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios'


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

    if (error.response) {
        switch (error.response.status) {
            case 401:
                error.message = "A sua sessão não é válida!"
                break;
            case 403:
                error.message = "Não tem permissões para executar essa ação!"
                break;
            case 404:
                error.message = "O recurso pedido não foi encontrado pelo servidor..."
                break;
            case 406:
                error.message = "O servidor declarou que os dados recebidos não era aceitáveis, talvez exista um erro com o formulário enviado."
                break;
            case 500:
                error.message = "O servidor encontrou um erro interno :("
                break;
            default:
                error.message = "Ocorreu um erro de servidor desconhecido... Código: " + error.response.status;
                break;
        }
    }
    else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        error.message = "O servidor terminou a ligação de forma inesperada sem oferecer qualquer resposta..."
    }

    return Promise.reject(error);
});

const App = () => (
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
    </MuiThemeProvider>
)


export default App