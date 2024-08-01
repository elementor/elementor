// import ReactUtils from 'elementor-utils/react';
// // import App from './app2'
// import { ThemeProvider } from "@elementor/ui/styles";
// import Launchpad from "./components/launchpad";
//
// //
// // async function mount() {
// // 	rootElement = document.createElement( 'div' );
// //
// // 	document.body.appendChild( rootElement )
// //
// // 	ReactUtils.render( <App />, rootElement ); // eslint-disable-line react/no-deprecated
// // }
// //
// //
// // /**
// //  * Remove the app from the page
// //  */
// // function unmount() {
// // 	if ( ! rootElement ) {
// // 		return;
// // 	}
// //
// // 	ReactUtils.unmountComponentAtNode( rootElement ); // eslint-disable-line react/no-deprecated
// // }
// //
// // window.addEventListener( 'message', ( event ) => {
// // 	if ( ! event.data?.name?.startsWith( 'elementor/checklist' ) ) {
// // 		return;
// // 	}
// //
// // 	// const classNames = [ 'e-route-checklist' ];
// //
// // 	switch ( event.data.name ) {
// // 		case 'elementor/checklist/open':
// // 			// document.body.classList.add( ...classNames );
// // 			mount();
// // 			break;
// //
// // 		case 'elementor/checklist/close':
// // 			// document.body.classList.remove( ...classNames );
// // 			unmount();
// // 			break;
// // 	}
// // } );
//
// // const App = () =>  {
// // 	return (
// // 		<ThemeProvider colorScheme={ 'light' }>
// // 			<Launchpad />
// // 		</ThemeProvider>
// // 	);
// // }
// //
// // const rootElement = document.querySelector( '#e-checklist' );
// //
// // document.body.appendChild( rootElement )
// //
// // ReactUtils.render( <App />, rootElement ); // eslint-disable-line react/no-deprecated
//
//
//
// function App() {
// 	return (
// 		<ThemeProvider colorScheme={ 'light' }>
// 			<Launchpad />
// 		</ThemeProvider>
// 	);
// }
//
// // const rootElement = document.querySelector( '#e-checklist' );
//
// const rootElement = document.createElement( 'div' );
//
// document.body.appendChild( rootElement );
//
// ReactUtils.render( (
// 	<App />
// ), rootElement );
