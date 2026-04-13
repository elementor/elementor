import {
	DirectionProvider,
	Infotip,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';
import PromotionCard from './components/promotion-card';

const App = ( { isRTL, colorScheme, onClose, promotionData, ctaUrl } ) => {
	return (
		<DirectionProvider rtl={ isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ colorScheme }>
					<Infotip
						content={
							<PromotionCard
								doClose={ onClose }
								promotionData={ promotionData }
								ctaUrl={ ctaUrl }
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

export default App;
