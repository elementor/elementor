import WpDashboardTracking, { CONTROL_TYPES } from '../wp-dashboard-tracking';
import { DashboardUtils } from './utils';
import BaseTracking from './base-tracking';

class PluginActionsTracking extends BaseTracking {
	static init() {
		if ( ! DashboardUtils.isPluginsPage() ) {
			return;
		}

		this.attachPluginActionListeners();
	}

	static attachPluginActionListeners() {
		this.addEventListenerTracked(
			document,
			'click',
			( event ) => {
				const target = event.target;
				if ( ! target || 1 !== target.nodeType ) {
					return;
				}

				const link = target.closest( 'a' );
				if ( ! link ) {
					return;
				}

				const href = link.getAttribute( 'href' );
				if ( ! href ) {
					return;
				}

				const pluginAction = this.getPluginAction( link, href );
				if ( ! pluginAction ) {
					return;
				}

				this.trackControl( link, pluginAction );
			},
			{ capture: true },
		);
	}

	static getPluginAction( link, href ) {
		const elementorPluginRow = this.findElementorPluginRow( link );
		if ( ! elementorPluginRow ) {
			return null;
		}

		if ( this.isDeactivateLink( link, href ) ) {
			return 'plugin_deactivate';
		}

		if ( this.isDeleteLink( link, href ) ) {
			return 'plugin_delete';
		}

		return null;
	}

	static findElementorPluginRow( link ) {
		const pluginRow = link.closest( 'tr[data-plugin], tr[data-slug]' );
		if ( ! pluginRow ) {
			return null;
		}

		const pluginData = pluginRow.getAttribute( 'data-plugin' );
		const pluginSlug = pluginRow.getAttribute( 'data-slug' );

		const isElementorPlugin = ( pluginData && pluginData.includes( 'elementor/elementor.php' ) ) ||
			( pluginSlug && pluginSlug.includes( 'elementor' ) );

		return isElementorPlugin ? pluginRow : null;
	}

	static isDeactivateLink( link, href ) {
		if ( href.includes( 'action=deactivate' ) ) {
			return true;
		}

		const linkText = link.textContent.trim().toLowerCase();
		if ( linkText.includes( 'deactivate' ) ) {
			return true;
		}

		return false;
	}

	static isDeleteLink( link, href ) {
		if ( href.includes( 'action=delete' ) ) {
			return true;
		}

		const linkText = link.textContent.trim().toLowerCase();
		if ( linkText.includes( 'delete' ) ) {
			return true;
		}

		return false;
	}

	static trackControl( element, pluginAction ) {
		const controlIdentifier = pluginAction;
		WpDashboardTracking.trackActionControl( controlIdentifier, CONTROL_TYPES.LINK );
	}
}

export default PluginActionsTracking;

