import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';

import { ComponentsList } from './components-list';

export const Components = () => {
	return (
		<ThemeProvider>
			<ComponentsList />
		</ThemeProvider>
	);
};
