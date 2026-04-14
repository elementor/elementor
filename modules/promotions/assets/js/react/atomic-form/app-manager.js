import App from './app';
import { createRoot } from 'react-dom/client';

export class AppManager {
	constructor() {
		this.root = null;
		this.wrapperEl = null;
		this.onRoute = () => {};

		this.attachPromotionListeners();
	}

	getPromotionData() {
		return elementor.config.atomicFormPromotion || {};
	}

	attachPromotionListeners() {
		document.addEventListener( 'atomic-form-promotion:open', ( event ) => {
			const promotionData = this.getPromotionData();

			this.mount( event.detail.target, promotionData.widgetCtaUrl );
		} );
	}

	mount( targetEl, ctaUrl ) {
		this.unmount();

		this.wrapperEl = document.createElement( 'span' );
		this.wrapperEl.className = 'e-atomic-form-promotion-wrapper';
		targetEl.appendChild( this.wrapperEl );

		this.attachEditorEventListeners();

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
		const isRTL = elementorCommon.config.isRTL;
		const promotionData = this.getPromotionData();

		this.root = createRoot( this.wrapperEl );
		this.root.render(
			<App
				colorScheme={ colorScheme }
				isRTL={ isRTL }
				promotionData={ promotionData }
				ctaUrl={ ctaUrl }
				onClose={ () => this.unmount() }
			/>,
		);
	}

	unmount() {
		if ( this.root ) {
			this.detachEditorEventListeners();
			this.root.unmount();
		}

		if ( this.wrapperEl && this.wrapperEl.parentNode ) {
			this.wrapperEl.parentNode.removeChild( this.wrapperEl );
		}

		this.root = null;
		this.wrapperEl = null;
	}

	attachEditorEventListeners() {
		this.onRoute = ( component, route ) => {
			if ( route !== 'panel/elements/categories' && route !== 'panel/editor/content' ) {
				return;
			}
			this.unmount();
		};

		$e.routes.on( 'run:after', this.onRoute );
	}

	detachEditorEventListeners() {
		$e.routes.off( 'run:after', this.onRoute );
	}
}
