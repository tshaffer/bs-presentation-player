import * as React from 'react';
import { isNil } from 'lodash';
import isomorphicPath from 'isomorphic-path';

import { connect } from 'react-redux';
import { getAssetPath } from '../selector';
import { BsPpState, bsPpStateFromState } from '../type';
import * as sizeOf from 'image-size';
import { calculateAspectRatioFit, Dimensions } from '../utility';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface ImagePropsFromParent {
  assetName: string;
  zoneWidth: number;
  zoneHeight: number;
  screenDimensions: Dimensions;
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

    console.log(this.props.filePath);

    const dimensions = sizeOf(this.props.filePath);
    if (isNil(dimensions)) {
      return null;
    }

    const scaledDimensions = calculateAspectRatioFit(
      dimensions.width,
      dimensions.height,
      this.props.zoneWidth,
      this.props.zoneHeight);

    const left = (this.props.screenDimensions.width - scaledDimensions.width) / 2;
    const top = (this.props.screenDimensions.height - scaledDimensions.height) / 2;

    return (
      <img
        style={{
          position: 'absolute',
          left,
          top,
        }}
        src={src}
        width={scaledDimensions.width.toString()}
        height={scaledDimensions.height.toString()}
      />
    );
  }
}

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (state: BsPpState, ownProps: ImagePropsFromParent): Partial<ImageProps> => {
  state = bsPpStateFromState(state);
  return {
    filePath: getAssetPath(state, ownProps.assetName),
    zoneWidth: ownProps.zoneWidth,
    zoneHeight: ownProps.zoneHeight,
    assetName: ownProps.assetName,
  };
};

export const Image = connect(mapStateToProps)(ImageComponent);
