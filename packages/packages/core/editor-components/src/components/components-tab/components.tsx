import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';

import { ComponentSearch } from './component-search';
import { ComponentsList } from './components-list';
import { SearchProvider } from './search-provider';

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
