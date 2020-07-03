import * as React from 'react';
import { isNil } from 'lodash';
import isomorphicPath from 'isomorphic-path';

import { connect } from 'react-redux';
import { getPoolFilePath } from '../selector';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

/** @internal */
export interface ImageProps {
  filePath: string;
  width: number;
  height: number;
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

const mapStateToProps = (state: any, ownProps: any): any => {
  return {
    filePath: getPoolFilePath(state, ownProps.fileName),
    width: ownProps.width,
    height: ownProps.height,
  };
};

export const Image = connect(mapStateToProps)(ImageComponent);
