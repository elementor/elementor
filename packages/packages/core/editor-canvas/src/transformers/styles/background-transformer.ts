import { createMultiPropsValue } from '../../renderers/multi-props';
import { createTransformer } from '../create-transformer';
import { type BackgroundOverlayTransformed } from './background-overlay-transformer';

type Background = {
	'background-overlay'?: BackgroundOverlayTransformed;
	color?: string;
	clip?: 'border-box' | 'padding-box' | 'content-box' | 'text' | null;
};

export const backgroundTransformer = createTransformer( ( value: Background ) => {
	const { color = null, 'background-overlay': overlays = null, clip = null } = value;

	return createMultiPropsValue( {
		...overlays,
		'background-color': color,
		'background-clip': clip,
	} );
} );
