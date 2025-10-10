import { createTransformer } from '../create-transformer';

type BackgroundImageSizeScale = {
	width?: string;
	height?: string;
};

export const backgroundImageSizeScaleTransformer = createTransformer(
	( { width, height }: BackgroundImageSizeScale ) => `${ width ?? 'auto' } ${ height ?? 'auto' }`
);
