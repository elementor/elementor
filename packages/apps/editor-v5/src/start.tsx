import * as React from 'react';
import { type JSX } from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { createAgentRuntime } from '@elementor/editor-v5-agent';
import { configureEditorAjax, dispatchReadyEvent, getInitialElements, saveDocument } from '@elementor/editor-v5-runtime';
import { hydrate } from '@elementor/editor-v5-store';
import { createQueryClient, QueryClientProvider } from '@elementor/query';
import { __createStore, __StoreProvider as StoreProvider } from '@elementor/store';
import { DirectionProvider, ThemeProvider } from '@elementor/ui';

import Shell from './components/shell';

type ElementorConfigWindow = Window & {
	elementorV5Agent?: ReturnType< typeof createAgentRuntime >;
};

export function start( domElement: Element ): void {
	const store = __createStore();
	const queryClient = createQueryClient();

	configureEditorAjax();
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
			// eslint-disable-next-line react/no-deprecated
			ReactDOM.render( app, domElement );
		};
	}

	renderFn();
}
