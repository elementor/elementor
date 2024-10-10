import App from './app';
import { createRoot } from 'react-dom/client';

export default class ReactPromotionBehavior extends Marionette.Behavior {
	ui() {
		return {
			animatedHeadlineButton: '.e-control-header-promotion-promotion',
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
			rootElement = document.querySelector( '.e-promotion-react' );

		if ( ! rootElement ) {
			return;
		}

		const root = createRoot( rootElement );

		root.render(
			<App
				colorScheme={ colorScheme }
				isRTL={ isRTL }
				promotionsData={ elementorPromotionsData }
				onClose={ () => this.unmount( root ) }
			/>,
		);
	}

	unmount( root ) {
		if ( root ) {
			root.unmount();
		}
	}
}
