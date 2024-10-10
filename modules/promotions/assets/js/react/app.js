import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';

import Infotip from '@elementor/ui/Infotip';
import PromotionCard from './components/promotion-card';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ props.colorScheme }>
					<Infotip
						content={ <PromotionCard promotionsData = { props.promotionsData } /> }
						placement="right-start"
						arrow={ true }
						open={ true }
						onClose={ props.onClose }
						PopperProps={ {
							modifiers: [
								{
									name: 'offset',
									options:
										{ offset: [ -16, 8 ] },
								},
							],
						} }
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
	promotionsData: PropTypes.object,
	onClose: PropTypes.func.isRequired,
};

export default App;
