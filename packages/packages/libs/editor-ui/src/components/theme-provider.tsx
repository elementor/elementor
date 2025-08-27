import * as React from 'react';
import { ThemeProvider as ThemeProviderBase, type ThemeProviderProps } from '@elementor/ui';

import { useColorScheme } from '../hooks/use-color-scheme';

const EDITOR_PALLETTE: ThemeProviderProps[ 'palette' ] = 'unstable';

export default function ThemeProvider( { children }: { children: React.ReactNode } ) {
	const colorScheme = useColorScheme();

	return (
		<ThemeProviderBase colorScheme={ colorScheme } palette={ EDITOR_PALLETTE }>
			{ children }
		</ThemeProviderBase>
	);
}
