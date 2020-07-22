import * as React from 'react';
import { isNil } from 'lodash';
import isomorphicPath from 'isomorphic-path';

import { connect } from 'react-redux';
import { getPoolFilePath } from '../selector';
import { BsPpState, bsPpStateFromState } from '../type';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface ImagePropsFromParent {
  fileName: string;
  width: number;
  height: number;
}

export interface ImageProps extends ImagePropsFromParent {
  filePath: string;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

export class ImageComponent extends React.Component<ImageProps> {
  render() {

    const src: string = isomorphicPath.join('file://', this.props.filePath);

    if (isNil(this.props.width)) {
      return (
        <img
          src={src}
        />
      );
    } else {
      return (
        <img
          src={src}
          width={this.props.width.toString()}
          height={this.props.height.toString()}
        />
      );
    }
  }
}

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (state: BsPpState, ownProps: ImagePropsFromParent): ImageProps => {
  state = bsPpStateFromState(state);
  return {
    filePath: getPoolFilePath(state, ownProps.fileName),
    width: ownProps.width,
    height: ownProps.height,
    fileName: ownProps.fileName,
  };
};

export const Image = connect(mapStateToProps)(ImageComponent);
