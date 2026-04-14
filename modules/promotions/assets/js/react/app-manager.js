import App from './app';
import { createRoot } from 'react-dom/client';

export class AppManager {
	constructor() {
		this.promotionInfoTip = null;
		this.atomicFormWrapper = null;
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

	mountAtomicForm( targetEl, ctaUrl ) {
		this.unmount();

		this.atomicFormWrapper = document.createElement( 'span' );
		this.atomicFormWrapper.className = 'e-atomic-form-promotion-wrapper';
		targetEl.appendChild( this.atomicFormWrapper );

		this.attachEditorEventListeners();

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
		const isRTL = elementorCommon.config.isRTL;
		const promotionData = this.getAtomicFormPromotionData();

		this.promotionInfoTip = createRoot( this.atomicFormWrapper );
		this.promotionInfoTip.render(
			<App
				colorScheme={ colorScheme }
				isRTL={ isRTL }
				cardType="atomicForm"
				promotionData={ promotionData }
				ctaUrl={ ctaUrl }
				onClose={ () => this.unmount() }
			/>,
		);
	}

	attachAtomicFormListeners() {
		document.addEventListener( 'atomic-form-promotion:open', ( event ) => {
			const promotionData = this.getAtomicFormPromotionData();

			this.mountAtomicForm( event.detail.target, promotionData.widgetCtaUrl );
		} );
	}

	unmount() {
		if ( this.promotionInfoTip ) {
			this.detachEditorEventListeners();
			this.promotionInfoTip.unmount();
		}

		if ( this.atomicFormWrapper && this.atomicFormWrapper.parentNode ) {
			this.atomicFormWrapper.parentNode.removeChild( this.atomicFormWrapper );
		}

		this.promotionInfoTip = null;
		this.atomicFormWrapper = null;
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
