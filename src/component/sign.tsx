import * as React from 'react';
import { connect } from 'react-redux';

import { DmState } from '@brightsign/bsdatamodel';

import {
  DmcZone,
  dmGetZoneById,
  dmGetZonesForSign,
} from '@brightsign/bsdatamodel';
import { MediaZone } from './mediaZone';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface SignProps {
  bsdm: DmState;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

class SignComponent extends React.Component<SignProps> {

  constructor(props: SignProps) {
    super(props);
  }

  getMediaZoneJSX(zone: DmcZone): object {

    return (
      <div
        key={zone.id}
        style={{
          position: 'absolute',
          left: zone.absolutePosition.x,
          top: zone.absolutePosition.y,
          width: zone.absolutePosition.width,
          height: zone.absolutePosition.height,
        }}
      >
        <MediaZone
          key={zone.id}
          bsdm={this.props.bsdm}
          zone={zone}
          width={Number(zone.absolutePosition.width)}
          height={Number(zone.absolutePosition.height)}
          activeMediaStateId={''}
        />
      </div>
    );
  }

  getTickerZoneJSX(zone: DmcZone): object {

    return (
      <div
        key={zone.id}
        style={{
          position: 'absolute',
          left: zone.absolutePosition.x,
          top: zone.absolutePosition.y,
          width: zone.absolutePosition.width,
          height: zone.absolutePosition.height,
        }}
      >
        <div>
          Pizza
        </div>
      </div>
    );
  }

  getZoneJSX(zoneId: string): object | null {

    const zone: DmcZone = dmGetZoneById(this.props.bsdm, { id: zoneId }) as DmcZone;

    switch (zone.type) {
      case 'VideoOrImages': {
        return this.getMediaZoneJSX(zone);
      }
      case 'Ticker': {
        return this.getTickerZoneJSX(zone);
      }
      default: {
        debugger;
      }
    }

    return null;
  }

  render() {

    const zoneIds: string[] = dmGetZonesForSign(this.props.bsdm);

    return (
      <div>
        {
          zoneIds.map((zoneId) =>
            this.getZoneJSX(zoneId),
          )
        }
      </div>
    );
  }
}

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (state: any): any => {
  return {
    bsdm: state.bsdm,
  };
};

export const Sign = connect(mapStateToProps)(SignComponent);
