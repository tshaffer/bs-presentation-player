import * as React from 'react';
import { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import isomorphicPath from 'isomorphic-path';

import { connect } from 'react-redux';
import { getPoolFilePath } from '../selector';
import { BsPpState } from '../type';
import { postVideoEnd } from '../controller';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface VideoPropsFromParent {
  fileName: string;
  width: number;
  height: number;
  onVideoRefRetrieved: (videoElementRef: any) => void;
}

export interface VideoProps extends VideoPropsFromParent {
  filePath: string;
  onVideoEnd: () => void;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

export class VideoComponent extends React.Component<VideoProps> {

  videoElementRef: any;

  onVideoRefRetrieved(videoElementRef: any) {
    this.videoElementRef = videoElementRef;
    this.props.onVideoRefRetrieved(videoElementRef);
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
          self.onVideoRefRetrieved(videoElementRef);
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

const mapStateToProps = (state: BsPpState, ownProps: VideoPropsFromParent): Partial<VideoProps> => {
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
  }, dispatch);
};

export const Video = connect(mapStateToProps, mapDispatchToProps)(VideoComponent);
