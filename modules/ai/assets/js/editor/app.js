import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import PropTypes from 'prop-types';
import PageContent from './page-content';
import { RequestIdsProvider } from './context/requests-ids';
import { onConnect } from './utils/editor-integration';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<ThemeProvider colorScheme={ props.colorScheme }>
				<RequestIdsProvider>
					<PageContent
						type={ props.type }
						controlType={ props.controlType }
						onClose={ props.onClose }
						onConnect={ onConnect }
						getControlValue={ props.getControlValue }
						setControlValue={ props.setControlValue }
						additionalOptions={ props.additionalOptions }
					/>
				</RequestIdsProvider>
			</ThemeProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	type: PropTypes.string,
	controlType: PropTypes.string,
	onClose: PropTypes.func,
	getControlValue: PropTypes.func,
	setControlValue: PropTypes.func,
	additionalOptions: PropTypes.object,
	isRTL: PropTypes.bool,
};

export default App;
