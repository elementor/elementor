import MenuPageView from 'elementor-panel/pages/menu/base';

export default class PanelMenu extends MenuPageView {
	initialize() {
		this.collection = PanelMenu.getGroups();
	}
}

PanelMenu.groups = null;

PanelMenu.createGroupItems = ( groupName, keys ) => {
	const tabs = $e.components.get( 'panel/global' ).getTabs();

	return keys.map( ( key ) => {
		const fullKey = groupName + '-' + key,
			tab = tabs[ fullKey ];

		return {
			name: fullKey,
			icon: tab.icon,
			title: tab.title,
			callback: () => $e.route( 'panel/global/' + fullKey ),
		};
	} );
};

PanelMenu.initGroups = () => {
	const settingsItems = PanelMenu.createGroupItems( 'settings', [ 'site-identity', 'background', 'layout', 'lightbox', 'custom-css' ] ),
		additionalSettingsProps = {
			name: 'settings-additional-settings',
			icon: 'eicon-tools',
			title: __( 'Additional Settings', 'elementor' ),
			type: 'link',
			link: elementor.config.admin_settings_url,
			newTab: true,
		};

	settingsItems.push( additionalSettingsProps );

	PanelMenu.groups = new Backbone.Collection( [
		{
			name: 'design_system',
			title: __( 'Design System', 'elementor' ),
			items: PanelMenu.createGroupItems( 'global', [ 'colors', 'typography' ] ),
		},
		{
			name: 'theme_style',
			items: PanelMenu.createGroupItems( 'theme-style', [ 'typography', 'buttons', 'images', 'form-fields' ] ),
			title: __( 'Theme Style', 'elementor' ),
		},
		{
			name: 'settings',
			title: __( 'Settings', 'elementor' ),
			items: settingsItems,
		},
	] );
};

PanelMenu.getGroups = () => {
	if ( ! PanelMenu.groups ) {
		PanelMenu.initGroups();
	}

	return PanelMenu.groups;
};
