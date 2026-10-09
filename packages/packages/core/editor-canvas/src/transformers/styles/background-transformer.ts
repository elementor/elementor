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

	const props = {
		...overlays,
		'background-color': color,
		'background-clip': clip,
	};

	// A solid color only sets background-color. A kit/site gradient is background-image
	// on the same element, and that image paints over the color unless it is cleared.
	if ( color && ! props[ 'background-image' ] ) {
		props[ 'background-image' ] = 'none';
	}

	return createMultiPropsValue( props );
} );
