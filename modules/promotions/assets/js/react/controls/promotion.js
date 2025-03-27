import App from '../app';
import { default as ControlBaseDataView } from 'elementor-controls/base-data';
import { createRoot } from 'react-dom/client';

export default class extends ControlBaseDataView {
	promotionInfoTip = null;

	selectors = {
		switcherElement: '.elementor-control-type-switcher',
		reactAnchor: '.e-promotion-react-wrapper',
	};

	ui() {
		return {
			switcher: '[data-promotion].elementor-control-type-switcher',
		};
	}

	events() {
		return {
			'click @ui.switcher': 'onClickControlSwitcher',
		};
	}

	promotionData( promotionType ) {
		return elementorPromotionsData[ promotionType ] || {};
	}

	onClickControlSwitcher( event ) {
		event.stopPropagation();
		this.mount( event.target );
	}

	mount( targetNode ) {
		if ( this.promotionInfoTip ) {
			return;
		}

		const wrapperElement = targetNode?.closest( this.selectors.switcherElement );
		const rootElement = wrapperElement?.querySelector( this.selectors.reactAnchor );

		if ( ! rootElement ) {
			return;
		}

		this.attachEditorEventListeners();

		this.promotionInfoTip = createRoot( rootElement );

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto',
			isRTL = elementorCommon.config.isRTL,
			promotionType = rootElement.getAttribute( 'data-promotion' )?.replace( '_promotion', '' );

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

	onRoute = () => {};

	attachEditorEventListeners() {
		this.onRoute = ( component, route ) => {
			if ( 'panel/elements/categories' !== route && 'panel/editor/content' !== route ) {
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
