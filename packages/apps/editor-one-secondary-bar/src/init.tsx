import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';

const ROOT_ELEMENT_ID = 'editor-one-secondary-bar';

export function init() {
	const rootElement = document.getElementById( ROOT_ELEMENT_ID );
	const config = window.editorOneSecondaryBarConfig;

	if ( ! rootElement || ! config?.tabs?.length ) {
		return;
	}

	createRoot( rootElement ).render( <App config={ config } /> );
}
