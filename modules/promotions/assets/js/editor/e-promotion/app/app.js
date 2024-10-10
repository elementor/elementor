import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';

import Infotip from '@elementor/ui/Infotip';
import PromotionCard from './components/promotion-card';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ props.colorScheme }>
					<Infotip
						placement="right"
						arrow={ true }
						open={ true }
						content={ <PromotionCard /> }
						onClose={ props.onClose }
					>
					</Infotip>
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	isRTL: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
};

export default App;
