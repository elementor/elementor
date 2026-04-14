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
						content={
							<PromotionCard
								doClose={ props.onClose }
								promotionData={ props.promotionData }
								ctaUrl={ props.ctaUrl }
							/>
						}
						placement="right"
						arrow={ true }
						open={ true }
						disableHoverListener={ true }
						PopperProps={ {
							modifiers: [
								{
									name: 'offset',
									options: {
										offset: [ -24, 8 ],
									},
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
	promotionData: PropTypes.object,
	ctaUrl: PropTypes.string,
	onClose: PropTypes.func.isRequired,
};

export default App;
