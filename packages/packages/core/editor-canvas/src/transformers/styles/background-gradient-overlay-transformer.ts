import { createTransformer } from '../create-transformer';

type BackgroundGradientOverlay = {
	type?: 'linear' | 'radial';
	angle?: number | null;
	stops?: string;
	positions?: string | null;
};

export const backgroundGradientOverlayTransformer = createTransformer( ( value: BackgroundGradientOverlay ) => {
	if ( value.type === 'radial' ) {
		return `radial-gradient(circle at ${ value.positions }, ${ value.stops })`;
	}

	if ( value.angle === null || value.angle === undefined ) {
		return `linear-gradient(${ value.stops })`;
	}

	return `linear-gradient(${ value.angle }deg, ${ value.stops })`;
} );
