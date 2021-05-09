import App from './app';
const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;

ReactDOM.render(
	<AppWrapper>
		<App />
	</AppWrapper>,
	document.getElementById( 'e-admin-top-bar' )
);

