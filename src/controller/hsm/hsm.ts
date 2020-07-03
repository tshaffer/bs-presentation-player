import { HSMStateData, PpHState, PpHsm, HsmData } from '../../type/hsm';
import { isNil } from 'lodash';
import {
  ArEventType,
  BsPpVoidPromiseThunkAction,
  BsPpDispatch,
  BsPpState,
  BsPpStringThunkAction,
} from '../../type';
import { addHsm } from '../../model/hsm';
import {
  setActiveHState,
  setHsmInitialized
} from '../../model';
import { getHsmById, getHStateById, getHsmInitialized } from '../../selector/hsm';
import {
  ppInitialPseudoStateHandler,
  HStateEventHandler
} from './eventHandler';
import { newBsPpId } from '../../utility';

export const ppCreateHsm = (
  name: string,
  type: string,
  data?: HsmData,
): BsPpStringThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    console.log('***** HSM.ts#ppCreateHsm');
    const hsmId: string = newBsPpId();
    dispatch(addHsm({
      id: hsmId,
      name,
      type,
      initialized: false,
      topStateId: '',
      activeStateId: null,
      hsmData: data,
    }));
    return hsmId;
  });
};

export function ppInitializeHsm(
  hsmId: string,
  initialPseudoStateHandler: () => void,
): BsPpVoidPromiseThunkAction {

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {

    console.log('***** HSM.ts#ppInitializeHsm');

    // any reason why the following call is necessary? It causes breakage....
    // dispatch(setActiveHState(hsmId, null));

    // execute initial transition
    if (!isNil(initialPseudoStateHandler)) {
      const action = ppInitialPseudoStateHandler(hsmId);

      return dispatch(action).
        then((activeState: any) => {
          dispatch(setActiveHState(hsmId, activeState));
          dispatch(completeHsmInitialization(hsmId));
          const hsmInitializationComplete = getHsmInitialized(getState(), hsmId);
          console.log('69 - end of hsmInitialize-0, hsmInitializationComplete: ' + hsmInitializationComplete);
          return Promise.resolve();
        });
    } else {
      debugger;
    }
  });
}

function completeHsmInitialization(
  hsmId: string,
): any { // returns dispatch -> promise

  let action: any;

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {

    // TEDTODO - necessary to have separate variables activeState and reduxActiveState?

    const hsm: PpHsm = getHsmById(getState(), hsmId);
    let reduxActiveState: PpHState | null = getHStateById(getState(), hsm.activeStateId);
    const reduxTopState: PpHState | null = getHStateById(getState(), hsm.topStateId);

    const stateData: HSMStateData = { nextStateId: null };

    // empty event used to get super states
    const emptyEvent: ArEventType = { EventType: 'EMPTY_SIGNAL' };

    // entry event
    const entryEvent: ArEventType = { EventType: 'ENTRY_SIGNAL' };

    // init event
    const initEvent: ArEventType = { EventType: 'INIT_SIGNAL' };

    // if there is no activeState, the playlist is empty
    if (isNil(reduxActiveState)) {
      dispatch(setActiveHState(hsmId, null));
      console.log('***** return from HSM.ts#completeHsmInitialization');
      dispatch(setHsmInitialized(hsmId, true));
      return;
    }

    if (!isNil(reduxActiveState)) {
      let activeState: PpHState = reduxActiveState;

      // start at the top state
      if (isNil(reduxTopState)) {
        debugger;
      }
      let sourceState = reduxTopState;

      while (true) {

        const entryStates = [];
        let entryStateIndex = 0;

        // target of the initial transition
        entryStates[0] = activeState;

        // send an empty event to get the super state
        action = HStateEventHandler((reduxActiveState as any), emptyEvent, stateData);
        status = dispatch(action);

        activeState = getHStateById(getState(), stateData.nextStateId) as PpHState;
        reduxActiveState = activeState;

        // walk up the tree until the current source state is hit
        while (activeState.id !== (sourceState as PpHState).id) {
          entryStateIndex = entryStateIndex + 1;
          entryStates[entryStateIndex] = activeState;
          action = HStateEventHandler((reduxActiveState as any), emptyEvent, stateData);
          status = dispatch(action);
          activeState = getHStateById(getState(), stateData.nextStateId) as PpHState;
          reduxActiveState = activeState;
        }

        // retrace the entry path in reverse (desired) order
        while (entryStateIndex >= 0) {
          const entryState = entryStates[entryStateIndex];
          action = HStateEventHandler((entryState as any), entryEvent, stateData);
          status = dispatch(action);
          entryStateIndex = entryStateIndex - 1;
        }

        // new source state is the current state
        sourceState = entryStates[0];

        action = HStateEventHandler((sourceState as any), initEvent, stateData);
        status = dispatch(action);
        if (status !== 'TRANSITION') {
          reduxActiveState = sourceState;
          dispatch(setActiveHState(hsmId, reduxActiveState));
          console.log('***** return from HSM.ts#completeHsmInitialization');
          dispatch(setHsmInitialized(hsmId, true));
          return;
        }

        activeState = getHStateById(getState(), stateData.nextStateId) as PpHState;
        reduxActiveState = activeState;
      }
    }
  });
}

export function constructorFunction(constructorHandler: () => void): void {
  if (!isNil(constructorHandler)) {
    constructorHandler();
  }
}

export function hsmDispatch(
  event: ArEventType,
  reduxHsmId: string,
  reduxActiveStateId: string | null,
) {

  let action: any;
  let status: string;

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {

    let reduxActiveState = getHStateById(getState(), reduxActiveStateId);

    console.log('***** HSM.ts#Dispatch');
    console.log(event.EventType);

    // if there is no activeState, the playlist is empty
    if (reduxActiveState == null) {
      dispatch(setActiveHState(reduxHsmId, reduxActiveState));
      return;
    }

    const stateData: HSMStateData = { nextStateId: null };

    // empty event used to get super states
    const emptyEvent: ArEventType = { EventType: 'EMPTY_SIGNAL' };

    // entry event
    const entryEvent: ArEventType = { EventType: 'ENTRY_SIGNAL' };

    // init event
    const initEvent: ArEventType = { EventType: 'INIT_SIGNAL' };

    // exit event
    const exitEvent: ArEventType = { EventType: 'EXIT_SIGNAL' };

    let t = reduxActiveState;                                                      // save the current state

    status = 'SUPER';
    let s: PpHState = reduxActiveState as PpHState; // TODO - initialized to reduce ts errors. TEDTODO - legit?
    while (status === 'SUPER') {                                                 // process the event hierarchically
      s = reduxActiveState as PpHState;
      action = HStateEventHandler((s as any), event, stateData);
      status = dispatch(action);
      reduxActiveState = getHStateById(getState(), stateData.nextStateId);
    }

    if (status === 'TRANSITION') {
      const path = [];

      path[0] = reduxActiveState;                                                // save the target of the transition
      path[1] = t;                                                            // save the current state

      // exit from the current state to the transition s
      while (t.id !== s.id) {
        action = HStateEventHandler((t as any), exitEvent, stateData);
        status = dispatch(action);
        if (status === 'HANDLED') {
          action = HStateEventHandler((t as any), emptyEvent, stateData);
          status = dispatch(action);
        }
        t = getHStateById(getState(), stateData.nextStateId) as PpHState;
      }

      t = path[0] as PpHState;                                                            // target of the transition

      // s is the source of the transition
      let ip: number = -1; // TEDTODO - initialization legit?
      // check source == target (transition to self)
      if (s.id === t.id) {
        action = HStateEventHandler((s as any), exitEvent, stateData);                // exit the source
        status = dispatch(action);
        ip = 0;
      } else {
        action = HStateEventHandler((t as any), emptyEvent, stateData);               // superstate of target
        status = dispatch(action);
        t = getHStateById(getState(), stateData.nextStateId) as PpHState;
        if (s.id === t.id) {                                                 // check source == target->super
          ip = 0;                                                         // enter the target
        } else {
          action = HStateEventHandler((s as any), emptyEvent, stateData);           // superstate of source
          status = dispatch(action);

          // check source->super == target->super
          if ((getHStateById(getState(), stateData.nextStateId) as PpHState).id === t.id) {
            action = HStateEventHandler((s as any), exitEvent, stateData);        // exit the source
            status = dispatch(action);
            ip = 0;                                                     // enter the target
          } else {
            if ((getHStateById(getState(), stateData.nextStateId) as PpHState).id === (path as PpHState[])[0].id) {
              // check source->super == target
              action = HStateEventHandler((s as any), exitEvent, stateData);    // exit the source
              status = dispatch(action);
            } else {
              let iq = 0;                                             // indicate LCA not found
              ip = 1;                                                 // enter target and its superstate
              path[1] = t;                                            // save the superstate of the target
              t = getHStateById(getState(), stateData.nextStateId) as PpHState;       // save source->super
              // get target->super->super
              const aState: any = (path as PpHState[])[1];
              action = HStateEventHandler(aState, emptyEvent, stateData);
              status = dispatch(action);
              while (status === 'SUPER') {
                ip = ip + 1;
                path[ip] = getHStateById(getState(), stateData.nextStateId);                     // store the entry path
                if ((getHStateById(getState(), stateData.nextStateId) as PpHState).id === s.id) { // is it the source?
                  iq = 1;                                         // indicate that LCA found
                  ip = ip - 1;                                    // do not enter the source
                  status = 'HANDLED';                             // terminate the loop
                } else {                                              // it is not the source; keep going up
                  const bState: any = (getHStateById(getState(), stateData.nextStateId) as PpHState);
                  action = HStateEventHandler(bState, emptyEvent, stateData);
                  status = dispatch(action);
                }
              }

              if (iq === 0) {                                           // LCA not found yet
                action = HStateEventHandler((s as any), exitEvent, stateData); // exit the source
                status = dispatch(action);

                // check the rest of source->super == target->super->super...
                iq = ip;
                status = 'IGNORED';                                 // indicate LCA not found
                while (iq >= 0) {
                  if (t.id === (path as PpHState[])[iq].id) {                      // is this the LCA?
                    status = 'HANDLED';                         // indicate LCA found
                    ip = iq - 1;                                // do not enter LCA
                    iq = -1;                                    // terminate the loop
                  } else {
                    iq = iq - 1;                                 // try lower superstate of target
                  }
                }

                if (status !== 'HANDLED') {                          // LCA not found yet?

                  // check each source->super->... for each target->super...
                  status = 'IGNORED';                             // keep looping
                  while (status !== 'HANDLED') {
                    action = HStateEventHandler((t as any), exitEvent, stateData);
                    status = dispatch(action);
                    if (status === 'HANDLED') {
                      action = HStateEventHandler((t as any), emptyEvent, stateData);
                      status = dispatch(action);
                    }
                    t = getHStateById(getState(), stateData.nextStateId) as PpHState;    // set to super of t
                    iq = ip;
                    while (iq > 0) {
                      if (t.id === (path as PpHState[])[iq].id) {              // is this the LCA?
                        ip = iq - 1;                        // do not enter LCA
                        iq = -1;                            // break inner
                        status = 'HANDLED';                 // break outer
                      } else {
                        iq = iq - 1;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // retrace the entry path in reverse (desired) order...
      while (ip >= 0) {
        const cState: any = (path as PpHState[])[ip];
        action = HStateEventHandler((cState as any), entryEvent, stateData);        // enter path[ip]
        status = dispatch(action);
        ip = ip - 1;
      }

      // stick the target into register */
      t = (path as PpHState[])[0];
      reduxActiveState = t;                                                   // update the current state */

      // console.log('HSM.ts#Dispatch: invoke handler with initEvent');

      // drill into the target hierarchy...
      action = HStateEventHandler((t as any), initEvent, stateData);
      status = dispatch(action);
      reduxActiveState = getHStateById(getState(), stateData.nextStateId);

      while (status === 'TRANSITION') {
        ip = 0;
        path[0] = reduxActiveState;
        action =
          HStateEventHandler((reduxActiveState as PpHState as any), emptyEvent, stateData); // find superstate
        status = dispatch(action);
        reduxActiveState = getHStateById(getState(), stateData.nextStateId);
        while ((reduxActiveState as PpHState).id !== t.id) {
          ip = ip + 1;
          path[ip] = reduxActiveState;
          action =
            HStateEventHandler((reduxActiveState as PpHState as any), emptyEvent, stateData); // find superstate
          status = dispatch(action);
          reduxActiveState = getHStateById(getState(), stateData.nextStateId);
        }
        reduxActiveState = path[0];

        while (ip >= 0) {
          const dState: any = (path as PpHState[])[ip];
          action = HStateEventHandler(dState, entryEvent, stateData);
          status = dispatch(action);
          ip = ip - 1;
        }

        t = (path as PpHState[])[0];

        action = HStateEventHandler((t as any), initEvent, stateData);
        status = dispatch(action);
      }
    }

    // set the new state or restore the current state
    reduxActiveState = t;

    dispatch(setActiveHState(reduxHsmId, reduxActiveState));
  });
}
