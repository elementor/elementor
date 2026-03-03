import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { List } from '@elementor/ui';

import { ComponentSearch } from '../../../components/components-tab/component-search';
import {
	EmptySearchResult,
	EmptyState,
	useFilteredComponents,
} from '../../../components/components-tab/components-list';
import { LoadingComponents } from '../../../components/components-tab/loading-components';
import { SearchProvider } from '../../../components/components-tab/search-provider';
import { useComponents } from '../../../hooks/use-components';
import { ComponentItem } from './component-item';

const ExtendedComponentsList = () => {
	const { components, isLoading, searchValue } = useFilteredComponents();

	if ( isLoading ) {
		return <LoadingComponents />;
	}

	const isEmpty = ! components?.length;

	if ( isEmpty ) {
		return searchValue.length ? <EmptySearchResult /> : <EmptyState />;
	}

	return (
		<List sx={ { display: 'flex', flexDirection: 'column', gap: 1, px: 2 } }>
			{ components.map( ( component ) => (
				<ComponentItem key={ component.uid } component={ component } />
			) ) }
		</List>
	);
};

const ExtendedComponentsContent = () => {
	const { components, isLoading } = useComponents();
	const hasComponents = ! isLoading && components.length > 0;

	return (
		<>
			{ hasComponents && <ComponentSearch /> }
			<ExtendedComponentsList />
		</>
	);
};

export const ExtendedComponents = () => {
	return (
		<ThemeProvider>
			<SearchProvider localStorageKey="elementor-components-search">
				<ExtendedComponentsContent />
			</SearchProvider>
		</ThemeProvider>
	);
};
