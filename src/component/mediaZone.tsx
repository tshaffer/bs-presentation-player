import * as React from 'react';
import { connect } from 'react-redux';

import { isString } from 'lodash';

import { ContentItemType } from '@brightsign/bscore';

import { BsDmId } from '@brightsign/bsdatamodel';
import { DmMediaState } from '@brightsign/bsdatamodel';
import { DmState } from '@brightsign/bsdatamodel';
import { DmZone } from '@brightsign/bsdatamodel';
import { DmEvent } from '@brightsign/bsdatamodel';
import { DmMediaContentItem } from '@brightsign/bsdatamodel';
import {
  DmDerivedContentItem,
  dmGetMediaStateById,
  dmGetEventIdsForMediaState,
  dmGetEventById,
  DmcEvent,
} from '@brightsign/bsdatamodel';

import { bsPpStateFromState } from '../type';
import { getActiveMediaStateId } from '../selector';
import { Image } from './image';
import { Video } from './video';
import { calculateAspectRatioFit } from '../utility';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface MediaZonePropsFromParent {
  bsdm: DmState;
  zone: DmZone;
  zoneWidth: number;
  zoneHeight: number;
}

export interface MediaZoneProps extends MediaZonePropsFromParent {
  mediaStateId: string;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------
export default class MediaZoneComponent extends React.Component<MediaZoneProps> {

  constructor(props: MediaZoneProps) {
    super(props);
  }

  renderMediaItem(mediaState: DmMediaState, contentItem: DmDerivedContentItem) {

    const mediaContentItem: DmMediaContentItem = contentItem as DmMediaContentItem;

    const mediaType: ContentItemType = mediaContentItem.type;

    const scaledDimensions = calculateAspectRatioFit(
      this.props.zoneWidth,
      this.props.zoneHeight,
      800,
      600
    );

    switch (mediaType) {
      case ContentItemType.Image: {
        return (
          <Image
            assetName={mediaState.name}
            zoneWidth={scaledDimensions.width}
            zoneHeight={scaledDimensions.height}
          />
        );
      }
      case ContentItemType.Video: {
        return (
          <Video
            assetName={mediaState.name}
            zoneWidth={scaledDimensions.width}
            zoneHeight={scaledDimensions.height}
          />
        );

      }
      default:
        debugger;
    }

    return null;
  }

  getEvents(bsdm: DmState, mediaStateId: string): DmEvent[] {

    let events: DmEvent[] = [];

    const eventIds: BsDmId[] = dmGetEventIdsForMediaState(bsdm, { id: mediaStateId });

    events = eventIds.map((eventId) => {
      return dmGetEventById(bsdm, { id: eventId }) as DmcEvent;
    });

    return events;
  }

  render() {

    if (!isString(this.props.mediaStateId) || this.props.mediaStateId.length === 0) {
      return null;
    }

    const mediaState: DmMediaState =
      dmGetMediaStateById(this.props.bsdm, { id: this.props.mediaStateId }) as DmMediaState;
    const contentItem: DmDerivedContentItem = mediaState.contentItem;

    switch (contentItem.type) {
      case ContentItemType.Image:
      case ContentItemType.Video: {
        return this.renderMediaItem(mediaState, contentItem as DmMediaContentItem);
      }
      default: {
        break;
      }
    }

    return null;
  }
}

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (
  state: any,
  ownProps: MediaZonePropsFromParent
): Partial<MediaZoneProps> => {
  state = bsPpStateFromState(state);
  return {
    bsdm: ownProps.bsdm,
    zone: ownProps.zone,
    zoneWidth: ownProps.zoneWidth,
    zoneHeight: ownProps.zoneHeight,
    mediaStateId: getActiveMediaStateId(state, ownProps.zone.id),
  };
};

export const MediaZone = connect(mapStateToProps)(MediaZoneComponent);
