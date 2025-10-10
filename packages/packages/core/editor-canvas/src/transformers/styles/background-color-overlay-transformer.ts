import { createTransformer } from '../create-transformer';

type BackgroundColorOverlay = {
	color?: string;
};

export const backgroundColorOverlayTransformer = createTransformer( ( value: BackgroundColorOverlay ) => {
	const { color = null } = value;

	if ( ! color ) {
		return null;
	}

	return `linear-gradient(${ color }, ${ color })`;
} );
