import { type ExtendedWindow } from './types';

const getElementorConfig = () => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor?.config ?? {};
};

export const getStylesSchema = () => {
	const config = getElementorConfig();
	const styleSchema = config?.atomic?.styles_schema ?? {};

	return styleSchema;
};

export const isExistingStyleProperty = ( property: string ): boolean => {
	const stylesSchema = getStylesSchema();
	return Object.keys( stylesSchema ).includes( property );
};
