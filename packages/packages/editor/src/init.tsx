import * as ReactDOM from 'react-dom';
import { isRTL } from '@wordpress/i18n';
import Shell from './components/shell';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import { StoreProvider, createStore } from '@elementor/store';
import { dispatchReadyEvent } from '@elementor/v1-adapters';
import { SettingsProvider } from './contexts/settings-context';

export default function init( domElement: HTMLElement, settings: Record<string, unknown> ): void {
	const store = createStore();

	dispatchReadyEvent();

	ReactDOM.render( (
		<SettingsProvider settings={ settings }>
			<StoreProvider store={ store }>
				<DirectionProvider rtl={ isRTL() }>
					<ThemeProvider>
						<Shell />
					</ThemeProvider>
				</DirectionProvider>
			</StoreProvider>
		</SettingsProvider>
	), domElement );
}
