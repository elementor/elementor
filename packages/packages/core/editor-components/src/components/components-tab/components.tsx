import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';

import { useComponents } from '../../hooks/use-components';
import { isProUser } from '../../utils/is-pro-user';
import { ComponentSearch } from './component-search';
import { ComponentsList } from './components-list';
import { ComponentsProNotification } from './components-pro-notification';
import { SearchProvider } from './search-provider';

const ComponentsContent = () => {
	const { components, isLoading } = useComponents();
	const hasComponents = ! isLoading && components.length > 0;

	return (
		<>
			{ hasComponents && <ComponentSearch /> }
			{ hasComponents && ! isProUser() && <ComponentsProNotification /> }
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
