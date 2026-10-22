import * as React from 'react';
import { ThemeProvider as ThemeProviderBase, type ThemeProviderProps } from '@elementor/ui';

import { type ColorScheme, useColorScheme } from '../hooks/use-color-scheme';

const EDITOR_PALETTE: ThemeProviderProps[ 'palette' ] = 'unstable';

export default function ThemeProvider( {
	children,
	colorScheme: staticColorScheme,
}: {
	children: React.ReactNode;
	colorScheme?: ColorScheme;
} ) {
	const colorScheme = useColorScheme( staticColorScheme );

	return (
		<ThemeProviderBase colorScheme={ colorScheme } palette={ EDITOR_PALETTE }>
			{ children }
		</ThemeProviderBase>
	);
}
