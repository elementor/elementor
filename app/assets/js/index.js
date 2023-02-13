import App from './app';
import ImportExport from '../../modules/import-export/assets/js/module';
import KitLibrary from '../../modules/kit-library/assets/js/module';
import Onboarding from '../../modules/onboarding/assets/js/module';
import { Module as SiteEditor } from '@elementor/site-editor';

import AppProvider from './app-context';
import Dashboard from '../../modules/dashboard/assets/js/module';

new ImportExport();
new KitLibrary();
new SiteEditor();
new Onboarding();
new Dashboard();

const AppWrapper = React.Fragment;

ReactDOM.render(
	<AppWrapper>
		<AppProvider>
			<App />
		</AppProvider>
	</AppWrapper>,
  document.getElementById( 'e-app' ),
);
