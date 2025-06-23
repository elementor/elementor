import { createMultiPropsValue } from '../../renderers/multi-props';
import { createTransformer } from '../create-transformer';
import { type BackgroundOverlayTransformed } from './background-overlay-transformer';

type Background = {
	'background-overlay'?: BackgroundOverlayTransformed;
	color?: string;
};

export const backgroundTransformer = createTransformer( ( value: Background ) => {
	const { color = null, 'background-overlay': overlays = null } = value;

	return createMultiPropsValue( {
		...overlays,
		'background-color': color,
	} );
} );
