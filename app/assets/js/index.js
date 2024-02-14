import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

import App from './app';
import ImportExport from '../../modules/import-export/assets/js/module';
import KitLibrary from '../../modules/kit-library/assets/js/module';
import Onboarding from '../../modules/onboarding/assets/js/module';
import { Module as SiteEditor } from '@elementor/site-editor';

import AppProvider from './app-context';

new ImportExport();
new KitLibrary();
new SiteEditor();
new Onboarding();

const AppWrapper = React.Fragment;

render( (
	<AppWrapper>
		<AppProvider>
			<App />
		</AppProvider>
	</AppWrapper>
), document.getElementById( 'e-app' ) );

// Support conditional rendering based on the React version.
// We use `createRoot` when available, but fallback to `ReactDOM.render` for older versions.
function render( app, domElement ) {
	let renderFn;

	try {
		const root = createRoot( domElement );

		renderFn = () => {
			root.render( app );
		};
	} catch ( e ) {
		renderFn = () => {
			// eslint-disable-next-line react/no-deprecated
			ReactDOM.render( app, domElement );
		};
	}

	renderFn();
}
