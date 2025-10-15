import { default as ControlBaseDataView } from 'elementor-controls/base-data';
import { AppManager } from '../app-manager';
export default class extends ControlBaseDataView {
	promotionInfoTip = null;

	constructor( options ) {
		super( options );

		this.AppManager = new AppManager();
	}
	selectors = {
		wrapperElement: '.elementor-control-type-switcher',
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
		this.AppManager.mount( event.target, this.selectors );
	}
}
