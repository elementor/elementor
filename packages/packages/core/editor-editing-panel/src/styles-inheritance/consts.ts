import { isExperimentActive } from '@elementor/editor-v1-adapters';

// the following prop types' style transformers would be ignored to provide alternative transformers for the styles inheritance popover
export const excludePropTypeTransformers = new Set( [
	'background-color-overlay',
	'background-image-overlay',
	'background-gradient-overlay',
	'gradient-color-stop',
	'color-stop',
	'background-image-position-offset',
	'background-image-size-scale',
	'image-src',
	'image',
	'background-overlay',
] );

export const isUsingIndicatorPopover = () => isExperimentActive( 'e_v_3_30' );
