import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';

import { App } from './app';
import { ROOT_ELEMENT_ID } from './constants';

export function init() {
	const rootElement = getOrCreateRootElement();

	createRoot( rootElement ).render(
		<DirectionProvider rtl={ document.dir === 'rtl' }>
			<LocalizationProvider>
				<ThemeProvider colorScheme="light" palette="unstable">
					<App container={ rootElement.ownerDocument.body } />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
}

function getOrCreateRootElement(): HTMLElement {
	const existing = document.getElementById( ROOT_ELEMENT_ID );

	if ( existing ) {
		return existing;
	}

	const el = document.createElement( 'div' );
	el.id = ROOT_ELEMENT_ID;
	document.body.appendChild( el );

	return el;
}
