import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { SearchProvider } from '@elementor/utils';

import { ComponentSearch } from './component-search';
import { ComponentsList } from './components-list';

export const Components = () => {
	return (
		<ThemeProvider>
			<SearchProvider localStorageKey="elementor-components-search">
				<ComponentSearch />
				<ComponentsList />
			</SearchProvider>
		</ThemeProvider>
	);
};
