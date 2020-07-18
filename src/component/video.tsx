import * as React from 'react';
import { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import isomorphicPath from 'isomorphic-path';

import { connect } from 'react-redux';
import { getPoolFilePath } from '../selector';
import { BsPpState } from '../type';
import { postVideoEnd } from '../controller';
import { setVideoElementRef } from '../model/playback';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface VideoPropsFromParent {
  fileName: string;
  width: number;
  height: number;
}

export interface VideoProps extends VideoPropsFromParent {
  filePath: string;
  onVideoEnd: () => void;
  onSetVideoElementRef: (videoElementRef: any) => void;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

// TEDTODO - VideoProps didn't work, so put in any
export class VideoComponent extends React.Component<any> {

  videoElementRef: HTMLVideoElement | null;

  handleSetVideoElementRef(videoElementRef: HTMLVideoElement | null) {
    this.videoElementRef = videoElementRef;
    this.props.onSetVideoElementRef(videoElementRef);
  }

  render() {

    const src: string = isomorphicPath.join('file://', this.props.filePath);

    const self = this;

    return (
      <video
        src={src}
        autoPlay={true}
        width={this.props.width.toString()}
        height={this.props.height.toString()}
        ref={(videoElementRef) => {
          console.log('videoElementRef retrieved');
          self.handleSetVideoElementRef(videoElementRef);
        }}
        onEnded={() => {
          console.log('**** - videoEnd');
          self.props.onVideoEnd();
        }}
      />
    );
  }
}

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

// TEDTODO - real return value didn't work, so put in any
const mapStateToProps = (state: BsPpState, ownProps: VideoPropsFromParent): any => {
  return {
    filePath: getPoolFilePath(state, ownProps.fileName),
    width: ownProps.width,
    height: ownProps.height,
    fileName: ownProps.fileName,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return bindActionCreators({
    onVideoEnd: postVideoEnd,
    onSetVideoElementRef: setVideoElementRef,
  }, dispatch);
};

export const Video = connect(mapStateToProps, mapDispatchToProps)(VideoComponent);
