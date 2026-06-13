import App from './app';
import { bindPreviewIframeEvents } from 'elementor-editor-utils/preview-iframe-listeners';
import { createRoot } from 'react-dom/client';

export class AppManager {
	constructor() {
		this.promotionInfoTip = null;
<<<<<<< HEAD
		this.atomicFormPromotionWrapper = null;
=======
		this.promotionWrapper = null;
>>>>>>> 9b3cf34022 (Internal: Improve popup display rules [ED-24383] (#36158))
		this.onRoute = () => {};
		this.unbindIframeEvents = () => {};

<<<<<<< HEAD
		this.attachAtomicFormListeners();
=======
		this.attachAtomicWidgetPromotionListeners();
		this.attachWidgetPromotionListeners();
>>>>>>> 9b3cf34022 (Internal: Improve popup display rules [ED-24383] (#36158))
	}

	getPromotionData( promotionType ) {
		return elementorPromotionsData[ promotionType ] || {};
	}

<<<<<<< HEAD
	getAtomicFormPromotionData() {
		return elementor?.config?.atomicFormPromotion || {};
=======
	resolveWidgetPromotionData( detail ) {
		const promotions = elementor?.config?.v4Promotions || {};

		const normalizedType = detail.widgetType.replace( /[-_]/g, '' ).toLowerCase();
		const key = Object.keys( promotions ).find( ( promotionKey ) => {
			return promotionKey.replace( /[-_]/g, '' ).toLowerCase() === normalizedType;
		} );

		const promotionData = key ? promotions[ key ] : null;
		const elementsPromotion = elementor.config.promotion?.elements || {};

		const fallbackCtaUrl = detail.ctaUrl || elementsPromotion.action_button?.url?.replace( '%s', detail.widgetType || '' ) || '';
		const fallbackCtaText = detail.ctaText || elementsPromotion.action_button?.text || '';
		const widgetName = detail.widgetTitle || detail.title || '';
		const hideProTag = detail.hideProTag || false;

		return promotionData ? {
			...promotionData,
			ctaUrl: promotionData.ctaUrl || fallbackCtaUrl,
			ctaText: promotionData.ctaText || fallbackCtaText,
			hideProTag,
		} : {
			title: detail.title || elementsPromotion.title?.replace( '%s', widgetName ) || '',
			content: detail.content || elementsPromotion.content?.replace( '%s', widgetName ) || '',
			ctaUrl: fallbackCtaUrl,
			ctaText: fallbackCtaText,
			hideProTag,
		};
>>>>>>> 9b3cf34022 (Internal: Improve popup display rules [ED-24383] (#36158))
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

<<<<<<< HEAD
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
=======
	mountCard( targetEl, wrapperClassName, appProps ) {
		this.unmount();

		this.promotionWrapper = document.createElement( 'span' );
		this.promotionWrapper.className = wrapperClassName;
		document.body.appendChild( this.promotionWrapper );

		this.attachEditorEventListeners();
		this.promotionInfoTip = createRoot( this.promotionWrapper );
>>>>>>> 9b3cf34022 (Internal: Improve popup display rules [ED-24383] (#36158))
		this.promotionInfoTip.render(
			<App
				colorScheme={ elementor?.getPreferences?.( 'ui_theme' ) || 'auto' }
				isRTL={ elementorCommon.config.isRTL }
				anchorTarget={ targetEl }
				doClose={ () => this.unmount() }
				{ ...appProps }
			/>,
		);
	}

	attachAtomicFormListeners() {
		document.addEventListener( 'atomic-form-promotion:open', ( event ) => {
			const promotionData = this.getAtomicFormPromotionData();

<<<<<<< HEAD
			this.mountAtomicFormPromotion( event.detail.target, promotionData.widgetCtaUrl );
=======
		promotions.forEach( ( { type, content } ) => {
			document.addEventListener( `${ type }-promotion:open`, ( event ) => {
				this.mountCard( event.detail.target, `e-${ type }-promotion-wrapper`, {
					cardType: 'atomicForm',
					promotionData: content,
					ctaUrl: content.widgetCtaUrl,
				} );
			} );
		} );
	}

	attachWidgetPromotionListeners() {
		document.addEventListener( 'widget-promotion:open', ( event ) => {
			this.mountCard( event.detail.target, 'e-widget-promotion-wrapper', {
				cardType: 'widgetPromotion',
				promotionData: this.resolveWidgetPromotionData( event.detail ),
			} );
>>>>>>> 9b3cf34022 (Internal: Improve popup display rules [ED-24383] (#36158))
		} );
	}

	unmount() {
		if ( this.promotionInfoTip ) {
			this.detachEditorEventListeners();
			this.promotionInfoTip.unmount();
			this.unbindIframeEvents();
		}

<<<<<<< HEAD
		if ( this.atomicFormPromotionWrapper && this.atomicFormPromotionWrapper.parentNode ) {
			this.atomicFormPromotionWrapper.parentNode.removeChild( this.atomicFormPromotionWrapper );
		}

		this.promotionInfoTip = null;
		this.atomicFormPromotionWrapper = null;
=======
		this.promotionWrapper?.parentNode?.removeChild( this.promotionWrapper );

		this.promotionInfoTip = null;
		this.promotionWrapper = null;
>>>>>>> 9b3cf34022 (Internal: Improve popup display rules [ED-24383] (#36158))
	}

	attachEditorEventListeners() {
		this.unbindIframeEvents = bindPreviewIframeEvents( () => this.unmount() );

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
