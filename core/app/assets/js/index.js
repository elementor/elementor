import App from './app';
import { Module as SiteEditor } from '@elementor/site-editor';

if ( location.href.includes( 'mode=iframe' ) ) {
	window.elementorCommon = window.top.elementorCommon;
	window.$e = window.top.$e;
}

new SiteEditor();

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;

ReactDOM.render(
	<AppWrapper>
		<App />
	</AppWrapper>,
  document.getElementById( 'e-app' )
);
