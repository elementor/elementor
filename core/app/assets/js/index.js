import App from './app';
import { Module as SiteEditor } from '@elementor/site-editor';
import KitLibrary from '../../modules/kit-library/assets/js/module';

new SiteEditor();
new KitLibrary();

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;

ReactDOM.render(
	<AppWrapper>
		<App />
	</AppWrapper>,
  document.getElementById( 'e-app' )
);
