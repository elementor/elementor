import { ThemeProvider } from '@elementor/ui';

import PageContent from './page-content';

const App = ( props ) => {
	return (
		<ThemeProvider colorScheme={ props.theme }>
			<PageContent
				type={ props.type }
				controlType={ props.controlType }
				onClose={ props.onClose }
				getControlValue={ props.getControlValue }
				setControlValue={ props.setControlValue }
				additionalOptions={ props.additionalOptions }
			/>
		</ThemeProvider>
	);
};

export default App;
