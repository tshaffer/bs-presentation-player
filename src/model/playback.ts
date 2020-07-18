import { BsPpAction } from './baseAction';
import { PlaybackState } from '../type';

export const SET_VIDEO_ELEMENT_REF = 'SET_VIDEO_ELEMENT_REF';

// TEDTODO - why doesn't the following work?
// export type SetPlaybackAction = BsPpAction<Partial<PlaybackState>>;
export type SetPlaybackAction = BsPpAction<PlaybackState>;

export const setVideoElementRef = (
  videoElementRef: HTMLVideoElement | null,
): SetPlaybackAction => {
  return {
    type: SET_VIDEO_ELEMENT_REF,
    payload: {
      videoElementRef,
    }
  };
};

export const playbackDefaults: PlaybackState = {
  videoElementRef: null,
};
Object.freeze(playbackDefaults);

export const playbackReducer = (
  state: PlaybackState = playbackDefaults,
  { type, payload }: (
    SetPlaybackAction
  ),
): PlaybackState => {
  switch (type) {
    case SET_VIDEO_ELEMENT_REF:
      const newState: PlaybackState = {
        videoElementRef: payload.videoElementRef
      };
      return newState;
    default:
      return state;
  }
};

// const isValidPlaybackState = (state: any): boolean => {
//   // TEDTODO
//   return true;
// };
