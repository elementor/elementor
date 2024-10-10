import App from './app';
import { createRoot } from 'react-dom/client';

export default class ReactPromotionBehavior extends Marionette.Behavior {
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

	promotionInfotip = null;

	mount() {
		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto',
			isRTL = elementorCommon.config.isRTL,
			rootElement = document.querySelector( '.e-promotion-react' );

		if ( ! rootElement ) {
			return;
		}

		this.promotionInfotip = createRoot( rootElement );

		this.promotionInfotip.render(
			<App
				colorScheme={ colorScheme }
				isRTL={ isRTL }
				promotionsData={ elementorPromotionsData }
				onClose={ () => this.unmount() }
			/>,
		);
	}

	unmount() {
		if ( this.promotionInfotip ) {
			this.promotionInfotip.unmount();
		}

		this.promotionInfotip = null;
	}
}
