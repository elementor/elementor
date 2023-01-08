import ReactDOM from 'react-dom';
import Shell from './components/shell';
import { createI18n, I18nContextProvider, CreateI18nSettings } from '@elementor/react-i18n';

type InitSettings = {
	i18n?: CreateI18nSettings;
}

export default function init( domElement: HTMLElement, settings: InitSettings = {} ) {
	const i18n = createI18n( settings?.i18n );

	ReactDOM.render(
		<I18nContextProvider i18n={ i18n }>
			<Shell />
		</I18nContextProvider>,
		domElement
	);
}
