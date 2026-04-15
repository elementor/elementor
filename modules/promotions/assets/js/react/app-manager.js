import App from './app';
import { createRoot } from 'react-dom/client';

export class AppManager {
	constructor() {
		this.promotionInfoTip = null;
		this.atomicFormPromotionWrapper = null;
		this.onRoute = () => {};

		this.attachAtomicFormListeners();
	}

	getPromotionData( promotionType ) {
		return elementorPromotionsData[ promotionType ] || {};
	}

	getAtomicFormPromotionData() {
		return elementor?.config?.atomicFormPromotion || {};
	}

	mount( targetNode, selectors ) {
		if ( this.promotionInfoTip ) {
			return;
		}

		const wrapperElement = targetNode?.closest( selectors.wrapperElement );
		const rootElement = wrapperElement?.querySelector( selectors.reactAnchor );

		if ( ! rootElement ) {
			return;
		}

		this.attachEditorEventListeners();

		this.promotionInfoTip = createRoot( rootElement );

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
		const isRTL = elementorCommon.config.isRTL;
		const promotionType = rootElement.getAttribute( 'data-promotion' )?.replace( '_promotion', '' );

		this.promotionInfoTip.render(
			<App
				colorScheme={ colorScheme }
				isRTL={ isRTL }
				promotionsData={ this.getPromotionData( promotionType ) }
				onClose={ () => this.unmount() }
			/>,
		);
	}

	mountAtomicFormPromotion( targetEl, ctaUrl ) {
		this.unmount();

		this.atomicFormPromotionWrapper = document.createElement( 'span' );
		this.atomicFormPromotionWrapper.className = 'e-atomic-form-promotion-wrapper';
		targetEl.appendChild( this.atomicFormPromotionWrapper );

		this.attachEditorEventListeners();

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
		const isRTL = elementorCommon.config.isRTL;
		const promotionData = this.getAtomicFormPromotionData();

		this.promotionInfoTip = createRoot( this.atomicFormPromotionWrapper );
		this.promotionInfoTip.render(
			<App
				colorScheme={ colorScheme }
				isRTL={ isRTL }
				cardType="atomicForm"
				promotionData={ promotionData }
				ctaUrl={ ctaUrl }
				doClose={ () => this.unmount() }
			/>,
		);
	}

	attachAtomicFormListeners() {
		document.addEventListener( 'atomic-form-promotion:open', ( event ) => {
			const promotionData = this.getAtomicFormPromotionData();

			this.mountAtomicFormPromotion( event.detail.target, promotionData.widgetCtaUrl );
		} );
	}

	unmount() {
		if ( this.promotionInfoTip ) {
			this.detachEditorEventListeners();
			this.promotionInfoTip.unmount();
		}

		if ( this.atomicFormPromotionWrapper && this.atomicFormPromotionWrapper.parentNode ) {
			this.atomicFormPromotionWrapper.parentNode.removeChild( this.atomicFormPromotionWrapper );
		}

		this.promotionInfoTip = null;
		this.atomicFormPromotionWrapper = null;
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
