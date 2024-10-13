import App from './app';
import { createRoot } from 'react-dom/client';

export default class ReactPromotionBehavior extends Marionette.Behavior {
	promotionInfoTip = null;

	selectors = {
		reactAnchor: '.e-promotion-react',
	};

	ui() {
		return {
			animatedHeadlineButton: '[data-promotion].elementor-control-type-switcher',
		};
	}

	events() {
		return {
			'click @ui.animatedHeadlineButton': 'onClickControlButtonAnimatedHeadline',
		};
	}

	promotionData( promotionType ) {
		return elementorPromotionsData[ promotionType ] || {};
	}

	onClickControlButtonAnimatedHeadline( event ) {
		event.stopPropagation();
		this.mount();
	}

	mount() {
		const rootElement = document.querySelector( this.selectors.reactAnchor );

		if ( ! rootElement ) {
			return;
		}

		if ( this.promotionInfoTip ) {
			return;
		}

		this.promotionInfoTip = createRoot( rootElement );

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto',
			isRTL = elementorCommon.config.isRTL,
			promotionType = rootElement.getAttribute( 'data-promotion' );

		this.promotionInfoTip.render(
			<App
				colorScheme={ colorScheme }
				isRTL={ isRTL }
				promotionsData={ this.promotionData( promotionType ) }
				onClose={ () => this.unmount() }
			/>,
		);
	}

	unmount() {
		if ( this.promotionInfoTip ) {
			this.promotionInfoTip.unmount();
		}

		this.promotionInfoTip = null;
	}
}
