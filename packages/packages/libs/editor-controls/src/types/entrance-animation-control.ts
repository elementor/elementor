export interface EntranceAnimationControlValue {
  animation: string;
  duration: 'slow' | 'normal' | 'fast';
  delay: number;
}

// Interface no longer needed since we use createControl pattern
// export interface EntranceAnimationControlProps {
//   value?: EntranceAnimationControlValue;
//   onChange: (value: EntranceAnimationControlValue) => void;
//   label?: string;
// }

export const ENTRANCE_ANIMATIONS = {
  '': 'None',
  'fadeIn': 'Fade In',
  'fadeInDown': 'Fade In Down',
  'fadeInLeft': 'Fade In Left',
  'fadeInRight': 'Fade In Right',
  'fadeInUp': 'Fade In Up',
  'fadeInTopLeft': 'Fade In Top Left',
  'fadeInTopRight': 'Fade In Top Right',
  'fadeInBottomLeft': 'Fade In Bottom Left',
  'fadeInBottomRight': 'Fade In Bottom Right',
  'bounceIn': 'Bounce In',
  'bounceInDown': 'Bounce In Down',
  'bounceInLeft': 'Bounce In Left',
  'bounceInRight': 'Bounce In Right',
  'bounceInUp': 'Bounce In Up',
  'slideInDown': 'Slide In Down',
  'slideInLeft': 'Slide In Left',
  'slideInRight': 'Slide In Right',
  'slideInUp': 'Slide In Up',
  'zoomIn': 'Zoom In',
  'zoomInDown': 'Zoom In Down',
  'zoomInLeft': 'Zoom In Left',
  'zoomInRight': 'Zoom In Right',
  'zoomInUp': 'Zoom In Up',
  'rotateIn': 'Rotate In',
  'rotateInDownLeft': 'Rotate In Down Left',
  'rotateInDownRight': 'Rotate In Down Right',
  'rotateInUpLeft': 'Rotate In Up Left',
  'rotateInUpRight': 'Rotate In Up Right',
  'backInDown': 'Back In Down',
  'backInLeft': 'Back In Left',
  'backInRight': 'Back In Right',
  'backInUp': 'Back In Up',
  'lightSpeedInRight': 'Light Speed In Right',
  'lightSpeedInLeft': 'Light Speed In Left',
  'flipInX': 'Flip In X',
  'flipInY': 'Flip In Y',
  'jackInTheBox': 'Jack In The Box',
  'rollIn': 'Roll In',
  'bounce': 'Bounce',
  'pulse': 'Pulse',
  'rubberBand': 'Rubber Band',
  'tada': 'Tada',
  'wobble': 'Wobble',
  'jello': 'Jello',
  'heartBeat': 'Heart Beat',
} as const;

export const DURATION_OPTIONS = {
  'slow': 'Slow',
  'normal': 'Normal',
  'fast': 'Fast'
} as const;

export const DURATION_VALUES = ['slow', 'normal', 'fast'] as const;

export type EntranceAnimationType = keyof typeof ENTRANCE_ANIMATIONS;
export type DurationType = typeof DURATION_VALUES[number]; 