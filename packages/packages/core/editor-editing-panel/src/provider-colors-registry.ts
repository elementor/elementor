import { type ChipProps, type Theme } from '@elementor/ui';

type Colors = {
	name: ChipProps[ 'color' ];
	getThemeColor: ( ( theme: Theme ) => string ) | null;
};

const DEFAULT_COLORS: Colors = {
	name: 'default',
	getThemeColor: null,
};

const providerColorsRegistry = new Map< string, Colors >();

export const registerStyleProviderToColors = ( provider: string, colors: Colors ) => {
	providerColorsRegistry.set( provider, colors );
};

export const getStyleProviderColors = ( provider: string ): Colors =>
	providerColorsRegistry.get( provider ) ?? DEFAULT_COLORS;
