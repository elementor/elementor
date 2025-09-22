import { createTransformer } from '../create-transformer';

type BackgroundImageSizeScale = {
	width?: string;
	height?: string;
};

export const backgroundImageSizeScaleTransformer = createTransformer(
	( value: BackgroundImageSizeScale | null | undefined ) => {
		if ( ! value || typeof value !== 'object' ) {
			return 'auto auto';
		}

		const { width, height } = value;
		return `${ width ?? 'auto' } ${ height ?? 'auto' }`;
	}
);
