import {
	DirectionProvider,
	Infotip,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';
import AtomicFormPromotionCard from './components/atomic-form-promotion-card';
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
	if ( 'atomicForm' === props.cardType ) {
		return <AtomicFormPromotionCard doClose={ props.doClose } promotionData={ props.promotionData } ctaUrl={ props.ctaUrl } />;
	}

	if ( 'widgetPromotion' === props.cardType ) {
		return <WidgetPromotionCard doClose={ props.doClose } promotionData={ props.promotionData } />;
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
};

export default App;
