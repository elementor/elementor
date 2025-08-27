import * as React from 'react';
import { ThemeProvider } from '@elementor/ui';
import { render, type RenderOptions } from '@testing-library/react';

export const renderWithTheme = ( ui: React.ReactNode, options = {} as RenderOptions ) => {
	return render( ui, {
		wrapper: ( { children } ) => <ThemeProvider>{ children }</ThemeProvider>,
		...options,
	} );
};
