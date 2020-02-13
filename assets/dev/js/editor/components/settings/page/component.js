import ComponentBase from 'elementor-api/modules/component-base';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'panel/page-settings';
	}

	defaultTabs() {
		return {
			settings: { title: elementor.translate( 'settings' ) },
			style: { title: elementor.translate( 'style' ) },
			advanced: { title: elementor.translate( 'advanced' ) },
		};
	}

	renderTab( tab ) {
		// Temp: If `page_settings` is not available, try after 1 second.
		// TODO: remove on 2.9.1.
		try {
			elementor.getPanelView().setPage( 'page_settings' ).activateTab( tab );
		} catch ( e ) {
			setTimeout( () => {
				$e.route( this.getNamespace() + '/' + tab );
			}, 1000 );
		}
	}

	getTabsWrapperSelector() {
		return '.elementor-panel-navigation';
	}
}
