import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Stack } from '@elementor/ui';
import { hasProInstalled } from '@elementor/utils';

import { useComponents } from '../../hooks/use-components';
import { ComponentSearch } from './component-search';
import { ComponentsList } from './components-list';
import { ComponentsProNotification } from './components-pro-notification';
import { SearchProvider } from './search-provider';

const ComponentsContent = () => {
	const { components, isLoading } = useComponents();
	const hasComponents = ! isLoading && components.length > 0;
	const hasPro = hasProInstalled();
	const showProNotification = ! hasPro && hasComponents;

	return (
		<Stack sx={ { height: '100%' } }>
			{ hasComponents && <ComponentSearch /> }
			<ComponentsList />
			{ showProNotification && <ComponentsProNotification /> }
		</Stack>
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
