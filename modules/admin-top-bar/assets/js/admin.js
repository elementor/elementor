import App from './app';
const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;
//
// const title = '';
// const buttons = [
// 	{
// 		label: 'asda',
// 		href: 'https://google.com',
// 	},
// 	{
//
// 	},
// ];

ReactDOM.render(
	<AppWrapper>
		<App />
	</AppWrapper>,
	document.getElementById( 'e-admin-top-bar' )
);

