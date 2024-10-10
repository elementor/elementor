import App from './app';
import { createRoot } from 'react-dom/client';

export default class ReactPromotionBehavior extends Marionette.Behavior {
	promotionInfoTip = null;

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

	onClickControlButtonAnimatedHeadline( event ) {
		event.stopPropagation();
		this.mount();
	}

	mount() {
		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto',
			isRTL = elementorCommon.config.isRTL,
			rootElement = document.querySelector( '.e-promotion-react' ),
			promotionType = rootElement?.closest( '.elementor-control-type-switcher' )?.dataset?.promotion;

		if ( ! rootElement ) {
			return;
		}

		this.promotionInfoTip = createRoot( rootElement );

		this.promotionInfoTip.render(
			<App
				colorScheme={ colorScheme }
				isRTL={ isRTL }
				promotionsData={ elementorPromotionsData[ promotionType ] }
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
