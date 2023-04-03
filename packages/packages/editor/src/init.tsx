import * as ReactDOM from 'react-dom';
import { isRTL } from '@wordpress/i18n';
import Shell from './components/shell';
import { DirectionProvider } from '@elementor/ui';
import { StoreProvider, createStore } from '@elementor/store';
import { dispatchReadyEvent } from '@elementor/v1-adapters';
import { SettingsProvider, Settings } from './contexts/settings-context';
import ThemeProvider from './components/theme-provider';

export default function init( domElement: HTMLElement, settings: Settings ): void {
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
