import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  bsDmReducer,
} from '@brightsign/bsdatamodel';

import { BsPpState } from '../src/type';
import { bsPpReducer } from '../src/index';
import {
  initPlayer
} from '../src/controller';
import {
  BsPp
} from '../src/component';

import './bootstrap.css';
import 'normalize.css/normalize.css';
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'font-awesome/css/font-awesome.min.css';

const logger = (appStore: any) => (next: any) => (action: any) => {
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.log('next state', appStore.getState());
  console.groupEnd();
  return result;
};

const getStore = () => {
  console.log('***************************** getStore() invoked');
  const reducers = combineReducers<BsPpState>({
    bsdm: bsDmReducer,
    bsPlayer: bsPpReducer,
  });
  return createStore<BsPpState>(
    reducers,
    composeWithDevTools(
      applyMiddleware(
        thunk,
        logger,
      ),
    ));
};

const store = getStore();

store.dispatch(initPlayer(store));

ReactDOM.render(
  <Provider store={store}>
    <BsPp />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
