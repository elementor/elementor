import App from './app';
import { createRoot } from 'react-dom/client';

export class AppManager {
	constructor() {
		this.promotionInfoTip = null;
		this.activePromotionWrapper = null;
		this.onRoute = () => {};

		this.attachAtomicWidgetPromotionListeners();
	}

	getPromotionData( promotionType ) {
		return elementorPromotionsData[ promotionType ] || {};
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

	mountCustomPromotion( targetEl, wrapperClassName, promotionData, ctaUrl ) {
		this.unmount();

		this.activePromotionWrapper = document.createElement( 'span' );
		this.activePromotionWrapper.className = wrapperClassName;
		targetEl.appendChild( this.activePromotionWrapper );

		this.attachEditorEventListeners();

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
		const isRTL = elementorCommon.config.isRTL;

		this.promotionInfoTip = createRoot( this.activePromotionWrapper );
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

	attachAtomicWidgetPromotionListeners() {
		const promotions = elementor?.config?.atomicWidgetPromotions || [];

		promotions.forEach( ( { type, content } ) => {
			document.addEventListener( `${ type }-promotion:open`, ( event ) => {
				this.mountCustomPromotion( event.detail.target, `e-${ type }-promotion-wrapper`, content, content.widgetCtaUrl );
			} );
		} );
	}

	unmount() {
		if ( this.promotionInfoTip ) {
			this.detachEditorEventListeners();
			this.promotionInfoTip.unmount();
		}

		if ( this.activePromotionWrapper?.parentNode ) {
			this.activePromotionWrapper.parentNode.removeChild( this.activePromotionWrapper );
		}

		this.promotionInfoTip = null;
		this.activePromotionWrapper = null;
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
