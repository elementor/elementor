import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import Checklist from './components/checklist';

const App = () => {
	const isRTL = elementorCommon.config.isRTL;

	fetch( `${ elementorCommon.config.urls.rest }elementor/v1/checklist/steps` )

	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme="light">
				<Checklist />
			</ThemeProvider>
		</DirectionProvider>
	);
};

export default App;
