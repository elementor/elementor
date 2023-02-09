import * as ReactDOM from 'react-dom';
import Shell from './components/shell';
import { StoreProvider, createStore } from '@elementor/store';
import { dispatchReadyEvent } from '@elementor/v1-adapters';
import { EnvContextProvider, EnvOptions } from './contexts/env-context';

export default function init( domElement: HTMLElement, envOptions: EnvOptions ): void {
	const store = createStore();

	dispatchReadyEvent();

	// TODO: Why those providers are here and the ThemeProvider is in the Shell?
	ReactDOM.render( (
		<EnvContextProvider { ...envOptions }>
			<StoreProvider store={ store }>
				<Shell />
			</StoreProvider>
		</EnvContextProvider>
	), domElement );
}
