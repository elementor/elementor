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
		if ( this.promotionInfoTip ) {
			return;
		}

		const rootElement = document.querySelector( this.selectors.reactAnchor );

		if ( ! rootElement ) {
			return;
		}

		this.attachEditorEventListeners();

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
			this.detachEditorEventListeners();
			this.promotionInfoTip.unmount();
		}

		this.promotionInfoTip = null;
	}

	attachEditorEventListeners() {
		$e.routes.on( 'run:after', this.unmount.bind( this ) );
	}

	detachEditorEventListeners() {
		$e.routes.off( 'run:after', this.unmount.bind( this ) );
	}
}
