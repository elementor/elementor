import * as React from 'react';
import { DirectionProvider, ThemeProvider } from '@elementor/ui';

import { useDirection } from '../../hooks/use-direction';

interface UiProvidersProps {
	children: React.ReactNode;
}

export const UiProviders: React.FC< UiProvidersProps > = ( { children } ) => {
	const { isSiteRtl } = useDirection();

	return (
		<DirectionProvider rtl={ isSiteRtl }>
			<ThemeProvider>{ children }</ThemeProvider>
		</DirectionProvider>
	);
};
