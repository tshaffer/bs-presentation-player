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

  /*
.container-div{ 
Display: flex;
Height: 100vh;
Width: 100vw; 
Align-Items: center;
Justify-Content: centre;
}

<Image
    img src={cur} alt="cur"
    height={350}
    width={700}
    style={{ alignSelf: 'center' }}
/>

.center{
    text-align: center;
    display: block;
    justify-content: center;
    align-items: center;
    margin: auto;
    width: 100%;
  }
*/
  render() {

    const src: string = isomorphicPath.join('file://', this.props.filePath);

    console.log(this.props.filePath);

    const dimensions = sizeOf(this.props.filePath);
    if (isNil(dimensions)) {
      return null;
    }

    const scaledDimensions = this.calculateAspectRatioFit(dimensions.width, dimensions.height, 800, 600);

    const left = (800 - scaledDimensions.width) / 2;
    const top = (600 - scaledDimensions.height) / 2;
    /*
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)'
        }}

        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

        style={{
          position: 'absolute',
          left,
          top,
        }}

    */
    // return (
    //   <div
    //     style={{
    //       position: 'absolute',
    //       left,
    //       top,
    //       width: 800,
    //       height: 600,
    //     }}
    //   >
    //     <img
    //       src={src}
    //       width={scaledDimensions.width.toString()}
    //       height={scaledDimensions.height.toString()}
    //     />
    //   </div >
    // );
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
