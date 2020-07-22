import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';

import { DmState } from '@brightsign/bsdatamodel';
import {
  initPresentation,
} from '../controller/appController';
import {
  PpSchedule,
  HsmMap,
  BsPpState,
  bsPpStateFromState,
} from '../type';
import { getAutoschedule, getHsmMap } from '../selector';
import { Sign } from './sign';
import {
  BsPpVoidThunkAction,
} from '../model';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

/** @internal */
/** @private */
export interface BsPpProps {
  autoschedule: PpSchedule | null;
  bsdm: DmState;
  hsmMap: HsmMap;
  onInitPresentation: () => BsPpVoidThunkAction;
}

// -----------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

class BsPpComponent extends React.Component<BsPpProps> {
  componentDidMount() {
    this.props.onInitPresentation();
  }

  render() {

    let initializationComplete = true;

    if (this.props.bsdm.zones.allZones.length === 0 ||
      Object.keys(this.props.hsmMap).length === 0) {
      initializationComplete = false;
    }

    for (const hsmId in this.props.hsmMap) {
      if (this.props.hsmMap.hasOwnProperty(hsmId)) {
        const hsm = this.props.hsmMap[hsmId];
        if (!hsm.initialized) {
          initializationComplete = false;
        }
      }
    }

    if (initializationComplete) {
      return (
        <Sign />
      );
    } else {
      return (
        <div>
          Waiting for the presentation to be loaded...
        </div>
      );
    }
  }
}

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

function mapStateToProps(state: BsPpState): Partial<BsPpProps> {

  const bsPpState: BsPpState = bsPpStateFromState(state);

  return {
    bsdm: state.bsdm,
    autoschedule: getAutoschedule(bsPpState),
    hsmMap: getHsmMap(bsPpState),
  };
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return bindActionCreators({
    onInitPresentation: initPresentation,
  }, dispatch);
};

export const BsPp = connect(mapStateToProps, mapDispatchToProps)(BsPpComponent);