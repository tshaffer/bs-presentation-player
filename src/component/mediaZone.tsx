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

import { BsPpState } from '../type';
import { getActiveMediaStateId } from '../selector';
import { Image } from './index';
import { Video } from './index';
import { tmpSetVideoElementRef } from '../controller';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface MediaZonePropsFromParent {
  bsdm: DmState;
  zone: DmZone;
  width: number;
  height: number;
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

  videoRefRetrieved(videoElementRef: any) {
    console.log('mediaZone.tsx#videoRefRetrieved');
    tmpSetVideoElementRef(videoElementRef);
  }

  renderMediaItem(mediaState: DmMediaState, contentItem: DmDerivedContentItem) {

    const self = this;

    const mediaContentItem: DmMediaContentItem = contentItem as DmMediaContentItem;

    const mediaType: ContentItemType = mediaContentItem.type;

    switch (mediaType) {
      case ContentItemType.Image: {
        return (
          <Image
            fileName={mediaState.name}
            width={this.props.width}
            height={this.props.height}
          />
        );
      }
      case ContentItemType.Video: {
        return (
          <Video
            fileName={mediaState.name}
            width={this.props.width}
            height={this.props.height}
            onVideoRefRetrieved={self.videoRefRetrieved}
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
  state: BsPpState,
  ownProps: MediaZonePropsFromParent
): Partial<MediaZoneProps> => {
  return {
    bsdm: ownProps.bsdm,
    zone: ownProps.zone,
    width: ownProps.width,
    height: ownProps.height,
    mediaStateId: getActiveMediaStateId(state, ownProps.zone.id),
  };
};

export const MediaZone = connect(mapStateToProps)(MediaZoneComponent);
