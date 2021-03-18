import App from './app';
import { Module as SiteEditor } from '@elementor/site-editor';
import ImportExport from '../../modules/import-export/assets/js/module';
import KitLibrary from '../../modules/kit-library/assets/js/module';

new SiteEditor();
new ImportExport();
new KitLibrary();

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;

ReactDOM.render(
	<AppWrapper>
		<App />
	</AppWrapper>,
  document.getElementById( 'e-app' )
);
