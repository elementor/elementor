import * as React from 'react';
import { App } from './app';
import { createRoot } from 'react-dom/client';

const ROOT_ELEMENT_ID = 'e-v4-opt-in-welcome';

export function init() {
	if ( ! document.body.classList.contains( 'elementor-editor-active' ) ) {
		return;
	}

	const rootElement = getOrCreateRootElement();

	createRoot( rootElement ).render( <App /> );
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
