import * as React from 'react';
import { PanelBody } from '@elementor/editor-panels';
import { ThemeProvider } from '@elementor/editor-ui';

import { useComponents } from '../../hooks/use-components';
import { ComponentSearch } from './component-search';
import { ComponentsList } from './components-list';
import { SearchProvider } from './search-provider';

const ComponentsContent = () => {
	const { components, isLoading } = useComponents();
	const hasComponents = ! isLoading && components.length > 0;

	return (
		<>
			{ hasComponents && <ComponentSearch /> }
			<ComponentsList />
		</>
	);
};

export const Components = () => {
	return (
		<ThemeProvider>
			<SearchProvider localStorageKey="elementor-components-search">
				<ComponentsContent />
			</SearchProvider>
		</ThemeProvider>
	);
};
