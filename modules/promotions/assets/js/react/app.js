import {
	DirectionProvider,
	Infotip,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';
import AtomicPromotionCard from './components/atomic-promotion-card';
import PromotionCard from './components/promotion-card';
import WidgetPromotionCard from './components/widget-promotion-card';

const OFFSET_MODIFIER = { name: 'offset', options: { offset: [ -24, 8 ] } };

function getPlacement( anchorTarget, isRTL ) {
	if ( ! anchorTarget ) {
		return 'right';
	}

	return isRTL ? 'left-start' : 'right-start';
}

function getCardContent( props ) {
	if ( 'atomic' === props.cardType ) {
		return <AtomicPromotionCard doClose={ props.doClose } onCtaClick={ props.onCtaClick } promotionData={ props.promotionData } />;
	}

	if ( 'widgetPromotion' === props.cardType ) {
		return <WidgetPromotionCard doClose={ props.doClose } onCtaClick={ props.onCtaClick } promotionData={ props.promotionData } />;
	}

	return <PromotionCard doClose={ props.onClose } promotionsData={ props.promotionsData } />;
}

const App = ( { colorScheme, isRTL, anchorTarget, ...props } ) => (
	<DirectionProvider rtl={ isRTL }>
		<LocalizationProvider>
			<ThemeProvider colorScheme={ colorScheme } palette="unstable">
				<Infotip
					content={ getCardContent( props ) }
					placement={ getPlacement( anchorTarget, isRTL ) }
					arrow
					open
					disableHoverListener
					PopperProps={ {
						modifiers: [ OFFSET_MODIFIER ],
						sx: { zIndex: ( theme ) => theme.zIndex.appBar - 1 },
						...( anchorTarget && { anchorEl: anchorTarget } ),
					} }
				><span /></Infotip>
			</ThemeProvider>
		</LocalizationProvider>
	</DirectionProvider>
);

App.propTypes = {
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	isRTL: PropTypes.bool,
	anchorTarget: PropTypes.object,
	cardType: PropTypes.string,
	promotionsData: PropTypes.object,
	promotionData: PropTypes.object,
	ctaUrl: PropTypes.string,
	doClose: PropTypes.func,
	onClose: PropTypes.func,
	onCtaClick: PropTypes.func,
};

export default App;
