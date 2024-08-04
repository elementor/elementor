
import ReactDOM from 'react-dom';

import { ThemeProvider } from "@elementor/ui/styles";
import Launchpad from "./components/launchpad";
//
console.log('app fuck my life');
debugger;

const App = () => {
	return (
		<ThemeProvider colorScheme={ 'light' }>
			<Launchpad />
		</ThemeProvider>
	);
}

const root = ReactDOM.createRoot(document.getElementById("e-checklist"));
root.render(
	<App />
);
