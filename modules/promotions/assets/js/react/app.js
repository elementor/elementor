import {
	DirectionProvider,
	Infotip,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';
import AtomicFormPromotionCard from './components/atomic-form-promotion-card';
import PromotionCard from './components/promotion-card';

const App = ( props ) => {
	const cardContent = 'atomicForm' === props.cardType
		? <AtomicFormPromotionCard doClose={ props.onClose } promotionData={ props.promotionData } ctaUrl={ props.ctaUrl } />
		: <PromotionCard doClose={ props.onClose } promotionsData={ props.promotionsData } />;

	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ props.colorScheme }>
					<Infotip
						content={ cardContent }
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
					><span /></Infotip>
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	isRTL: PropTypes.bool,
	cardType: PropTypes.string,
	promotionsData: PropTypes.object,
	promotionData: PropTypes.object,
	ctaUrl: PropTypes.string,
	onClose: PropTypes.func.isRequired,
};

export default App;
