import {
	DirectionProvider,
	Infotip,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';
import PromotionCard from './components/promotion-card';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ props.colorScheme }>
					<Infotip
						content={ <PromotionCard doClose={ props.onClose } promotionsData={ props.promotionsData } /> }
						placement="right"
						arrow={ true }
						open={ true }
						disableHoverListener={ true }
						PopperProps={ {
							modifiers: [
								{
									name: 'offset',
									options:
										{ offset: [ -24, 8 ] },
								},
							],
						} }
					/>
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
