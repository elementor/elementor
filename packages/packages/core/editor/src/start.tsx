import * as React from 'react';
import { type JSX } from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { ensureCurrentUser } from '@elementor/editor-current-user';
import { __privateDispatchReadyEvent as dispatchReadyEvent } from '@elementor/editor-v1-adapters';
import { createQueryClient, QueryClientProvider } from '@elementor/query';
import { __createStore, __StoreProvider as StoreProvider } from '@elementor/store';
import { DirectionProvider, ThemeProvider } from '@elementor/ui';

import Shell from './components/shell';

export function start( domElement: Element ): void {
	const store = __createStore();
	const queryClient = createQueryClient();

	dispatchReadyEvent();
	ensureCurrentUser( { queryClient } );

	render(
		<StoreProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<DirectionProvider rtl={ window.document.dir === 'rtl' }>
					<ThemeProvider>
						<Shell />
					</ThemeProvider>
				</DirectionProvider>
			</QueryClientProvider>
		</StoreProvider>,
		domElement
	);
}

// Support conditional rendering based on the React version.
// We use `createRoot` when available, but fallback to `ReactDOM.render` for older versions.
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
