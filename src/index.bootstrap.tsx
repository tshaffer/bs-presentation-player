import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import './asset/bootstrap.css';
import 'normalize.css/normalize.css';
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { combineReducers } from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
import { BsPpState } from './type/base';
import { bsPpReducer } from './model';
import { BsPp } from './component';
import { initPlayer } from './controller';

const logger = (store: any) => (next: any) => (action: any) => {
  // console.group(action.type);
  // console.info('dispatching', action);
  const result = next(action);
  // console.log('next state', store.getState());
  // console.groupEnd();
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

function bootstrapper() {

  console.log('bootstrapper');

  const store = getStore();

  store.dispatch(initPlayer(store));

  ReactDOM.render(
    <Provider store={store}>
      <BsPp />
    </Provider>,
    document.getElementById('root') as HTMLElement
  );

}

// setTimeout(bootstrapper, 30000);
setTimeout(bootstrapper, 1000);
