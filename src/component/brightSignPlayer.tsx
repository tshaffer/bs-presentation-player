import * as React from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import { Dispatch } from 'redux';
import { DmState } from '@brightsign/bsdatamodel';
import {
  initPresentation,
} from '../controller/appController';
import {
  PpSchedule, HsmMap,
} from '../type';
import { getAutoschedule, getHsms } from '../selector';
import { Sign } from './sign';
// import { isNil } from 'lodash';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface BrightSignPlayerProps {
  autoschedule: PpSchedule;
  bsdm: DmState;
  hsmMap: HsmMap;
  onInitPresentation: () => any;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

class BrightSignPlayerComponent extends React.Component<BrightSignPlayerProps> {

  state: object;

  constructor(props: BrightSignPlayerProps) {
    super(props);
  }

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
        <Sign
          bsdm={this.props.bsdm}
        />
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

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return bindActionCreators({
    onInitPresentation: initPresentation,
  }, dispatch);
};

function mapStateToProps(state: any) {
  return {
    bsdm: state.bsdm,
    autoschedule: getAutoschedule(state),
    hsmMap: getHsms(state),
  };
}

export const BrightSignPlayer = connect(mapStateToProps, mapDispatchToProps)(BrightSignPlayerComponent);
