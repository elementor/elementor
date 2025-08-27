import { ELEMENTS_BASE_STYLES_PROVIDER_KEY, isElementsStylesProvider } from '@elementor/editor-styles-repository';
import { type ChipProps, type Theme } from '@elementor/ui';

import { getStyleProviderColors } from '../provider-colors-registry';

export const getStylesProviderColorName = ( provider: string ): ChipProps[ 'color' ] => {
	if ( ! provider || provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY ) {
		return 'default';
	}

	if ( isElementsStylesProvider( provider ) ) {
		return 'accent';
	}

	return getStyleProviderColors( provider ).name;
};

export const getStylesProviderThemeColor = ( provider: string ): ( ( theme: Theme ) => string ) | null => {
	if ( ! provider || provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY ) {
		return null;
	}

	if ( isElementsStylesProvider( provider ) ) {
		return ( theme: Theme ) => theme.palette.accent.main;
	}

	return getStyleProviderColors( provider ).getThemeColor;
};

export function getTempStylesProviderThemeColor( provider: string ): ( ( theme: Theme ) => string ) | null {
	if ( isElementsStylesProvider( provider ) ) {
		return ( theme: Theme ) => theme.palette.primary.main;
	}

	return getStylesProviderThemeColor( provider );
}
