import { createTransformer } from '../create-transformer';

type BackgroundImageOverlay = {
	image?: {
		src?: string;
	};
	size?: string;
	position?: string;
	repeat?: string;
	attachment?: string;
};

export type BackgroundImageTransformed = {
	src: string | null;
	repeat: string | null;
	attachment: string | null;
	size: string | null;
	position: string | null;
};

export const backgroundImageOverlayTransformer = createTransformer( ( value: BackgroundImageOverlay ) => {
	const { image, size = null, position = null, repeat = null, attachment = null } = value;

	if ( ! image ) {
		return null;
	}

	const src = image.src ? `url(${ image.src })` : null;

	const backgroundStyles: BackgroundImageTransformed = {
		src,
		repeat,
		attachment,
		size,
		position,
	};

	return backgroundStyles;
} );
