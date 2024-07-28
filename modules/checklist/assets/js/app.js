import ReactUtils from 'elementor-utils/react';
import Launchpad from './components/launchpad';
import { ThemeProvider } from '@elementor/ui/styles';

function App() {
	return (
		<ThemeProvider colorScheme={ 'light' }>
			<Launchpad />
		</ThemeProvider>
	);
}

const rootElement = document.querySelector( '#e-checklist' );

ReactUtils.render( (
	<App />
), rootElement );
