import ReactDOM from 'react-dom';
import Shell from './components/shell';
import { createI18n, I18nContextProvider, CreateI18nOptions } from '@elementor/react-i18n';

type InitOptions = {
	i18n?: CreateI18nOptions;
}

export default function init( domElement: HTMLElement, options: InitOptions = {} ) {
	const i18n = createI18n( options?.i18n );

	ReactDOM.render(
		<I18nContextProvider i18n={ i18n }>
			<Shell />
		</I18nContextProvider>,
		domElement
	);
}
