import * as React from 'react';
import { type JSX } from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { createAgentRuntime } from '@elementor/editor-v5-agent';
import { hydrate, type DocumentSliceState } from '@elementor/editor-v5-store';
import { dispatchReadyEvent, saveDocument } from '@elementor/editor-v5-runtime';
import { createQueryClient, QueryClientProvider } from '@elementor/query';
import { __createStore, __StoreProvider as StoreProvider } from '@elementor/store';
import { DirectionProvider, ThemeProvider } from '@elementor/ui';

import Shell from './components/shell';

type ElementorConfigWindow = Window & {
	ElementorConfig?: {
		initial_document?: {
			elements?: DocumentSliceState[ 'editorV5Document' ][ 'elements' ];
		};
	};
	elementorV5Agent?: ReturnType< typeof createAgentRuntime >;
};

function getInitialElements() {
	const config = ( window as ElementorConfigWindow ).ElementorConfig;

	return config?.initial_document?.elements ?? [];
}

export function start( domElement: Element ): void {
	const store = __createStore();
	const queryClient = createQueryClient();

	store.dispatch( hydrate( { elements: getInitialElements() } ) );

	const agent = createAgentRuntime( store, {
		saveDocument: ( status ) => saveDocument( store.getState().editorV5Document.elements, status ),
	} );

	( window as ElementorConfigWindow ).elementorV5Agent = agent;

	dispatchReadyEvent();

	render(
		<StoreProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<DirectionProvider rtl={ window.document.dir === 'rtl' }>
					<ThemeProvider>
						<Shell agent={ agent } />
					</ThemeProvider>
				</DirectionProvider>
			</QueryClientProvider>
		</StoreProvider>,
		domElement
	);
}

function render( app: JSX.Element, domElement: Element ) {
	let renderFn: () => void;

	try {
		const root = createRoot( domElement );

		renderFn = () => {
			root.render( app );
		};
	} catch {
		renderFn = () => {
			ReactDOM.render( app, domElement );
		};
	}

	renderFn();
}
