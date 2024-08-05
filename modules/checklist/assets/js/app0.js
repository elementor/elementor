
import ReactDOM from 'react-dom';
import ReactUtils from 'elementor-utils/react';
import App from './app2';


import { ThemeProvider } from "@elementor/ui/styles";
import Launchpad from "./components/launchpad";
import { EditorDrawer } from "../../../notifications/assets/js/components/editor-drawer";
//
console.log('app fuck my life');
debugger;

// const App = () => {
// 	return (
// 		<ThemeProvider colorScheme={ 'light' }>
// 			<Launchpad />
// 		</ThemeProvider>
// 	);
// }


const root = ReactDOM.createRoot(document.getElementById("e-checklist"));
root.render(
	<App />
);

// const container = document.createElement( '#e-checklist' );
//
// document.body.append( container );
//
// ReactDOM.render( (
// 	<App />
// ), container );
