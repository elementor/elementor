import * as React from 'react';
import { useLayoutEffect } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Stack } from '@elementor/ui';

import { useComponents } from '../../hooks/use-components';
import { isProComponentsSupported, isProOutdatedForComponents } from '../../utils/is-pro-components-supported';
import { ComponentSearch } from './component-search';
import { ComponentsList } from './components-list';
import { ComponentsProNotification } from './components-pro-notification';
import { ComponentsUpdateNotification } from './components-update-notification';
import { SearchProvider } from './search-provider';

const FULL_HEIGHT_STYLE_ID = 'components-full-height-panel';

const FULL_HEIGHT_CSS = `
#elementor-panel-page-elements {
	display: flex;
	flex-direction: column;
	height: 100%;
}

#elementor-panel-elements {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
}

#elementor-panel-elements-wrapper {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
}
`;

const useFullHeightPanel = () => {
	useLayoutEffect( () => {
		let style = document.getElementById( FULL_HEIGHT_STYLE_ID );

		if ( ! style ) {
			style = document.createElement( 'style' );
			style.id = FULL_HEIGHT_STYLE_ID;
			style.textContent = FULL_HEIGHT_CSS;
			document.head.appendChild( style );
		}

		return () => {
			document.getElementById( FULL_HEIGHT_STYLE_ID )?.remove();
		};
	}, [] );
};

const ComponentsContent = () => {
	const { components, isLoading } = useComponents();
	const hasComponents = ! isLoading && components.length > 0;
	const showProNotification = ! isProComponentsSupported() && hasComponents;
	const isOutdated = isProOutdatedForComponents();

	useFullHeightPanel();

	return (
		<Stack justifyContent="space-between" sx={ { flex: 1, minHeight: 0 } }>
			{ hasComponents && <ComponentSearch /> }
			<ComponentsList />
			{ showProNotification && ( isOutdated ? <ComponentsUpdateNotification /> : <ComponentsProNotification /> ) }
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
