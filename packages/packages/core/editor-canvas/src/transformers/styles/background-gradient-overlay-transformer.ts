import { createTransformer } from '../create-transformer';

type BackgroundGradientOverlay = {
	type?: 'linear' | 'radial';
	angle?: string;
	stops?: string;
	positions?: string;
};

export const backgroundGradientOverlayTransformer = createTransformer( ( value: BackgroundGradientOverlay ) => {
	if ( value.type === 'radial' ) {
		return `radial-gradient(circle at ${ value.positions }, ${ value.stops })`;
	}

	return `linear-gradient(${ value.angle }deg, ${ value.stops })`;
} );
