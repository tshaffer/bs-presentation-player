import * as React from 'react';
import { isNil } from 'lodash';
import isomorphicPath from 'isomorphic-path';

import { connect } from 'react-redux';
import { getAssetPath } from '../selector';
import { BsPpState, bsPpStateFromState } from '../type';
import * as sizeOf from 'image-size';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface ImagePropsFromParent {
  assetName: string;
  zoneWidth: number;
  zoneHeight: number;
}

export interface ImageProps extends ImagePropsFromParent {
  filePath: string;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

interface Dimensions {
  width: number;
  height: number;
}

export class ImageComponent extends React.Component<ImageProps> {

  calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number): Dimensions {

    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return {
      width: srcWidth * ratio,
      height: srcHeight * ratio
    };
  }

  render() {

    const src: string = isomorphicPath.join('file://', this.props.filePath);

    console.log(this.props.filePath);

    const dimensions = sizeOf(this.props.filePath);
    if (isNil(dimensions)) {
      return null;
    }

    return (
      <img
        src={src}
        width={dimensions.width.toString()}
        height={dimensions.height.toString()}
      />
    );
  }
}

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (state: BsPpState, ownProps: ImagePropsFromParent): ImageProps => {
  state = bsPpStateFromState(state);
  return {
    filePath: getAssetPath(state, ownProps.assetName),
    zoneWidth: ownProps.zoneWidth,
    zoneHeight: ownProps.zoneHeight,
    assetName: ownProps.assetName,
  };
};

export const Image = connect(mapStateToProps)(ImageComponent);
