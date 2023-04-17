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

App.propTypes = {
	theme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	type: PropTypes.string,
	controlType: PropTypes.string,
	onClose: PropTypes.func,
	getControlValue: PropTypes.func,
	setControlValue: PropTypes.func,
	additionalOptions: PropTypes.object,
};

export default App;
