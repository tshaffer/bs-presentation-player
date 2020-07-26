import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import {
  bsReBaUwDmSaveMiddleware,
  bsReBatchMiddleware,
  bsReBatchStoreEnhancer,
} from '@brightsign/bs-redux-enhancer';
import {
  baImIpcRenderMiddleware,
  baImIpcReplayMainActionMessage,
} from '@brightsign/ba-ipc-manager';
import { bsnGetSession } from '@brightsign/bsnconnector';
import { getUserWorkspaceState } from '@brightsign/ba-uw-manager';
import {
  baUwDmReducer,
  BaUwDmState,
  baUwDmRehydrateModel,
} from '@brightsign/ba-uw-dm';
import { baTheme } from '@brightsign/bacon-theme';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  BaApUi,
  BaApUiState,
  isDesktop,
} from '../src';
import './bootstrap.css';
import 'normalize.css/normalize.css';
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { baApUiReducer } from '../src/model/baseReducer';

const middleware = [
  bsReBaUwDmSaveMiddleware,
  baImIpcRenderMiddleware,
  bsReBatchMiddleware,
  thunk,
];

const getStore = () => {
  const reducers = combineReducers<BaApUiState>({
    bauwdm: baUwDmReducer,
    baapui: baApUiReducer,
  });
  return createStore<BaApUiState>(
    reducers,
    composeWithDevTools(applyMiddleware(...middleware),
    bsReBatchStoreEnhancer,
  ));
};

const store = getStore();

if (isDesktop()) {
  baImIpcReplayMainActionMessage(store);
}

const renderApp = () => {
  ReactDOM.render(
    <MuiThemeProvider muiTheme={baTheme}>
      <Provider store={store}>
        <BaApUi />
      </Provider>
    </ MuiThemeProvider>,
    document.getElementById('root') as HTMLElement
  );
};

export const initApp = (): Promise<void> => {
  return bsnGetSession().activate('support@brightsign.biz', 'Password@123', 'spectrio')
    .then(() => getUserWorkspaceState())
    .then((baUwDmState: BaUwDmState) => store.dispatch(baUwDmRehydrateModel(baUwDmState)))
    .then(() => renderApp());
};

initApp();
