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
			title: elementor.translate( 'additional_settings' ),
			type: 'link',
			link: elementor.config.admin_settings_url,
			newTab: true,
		};

	settingsItems.push( additionalSettingsProps );

	PanelMenu.groups = new Backbone.Collection( [
		{
			name: 'design_system',
			title: elementor.translate( 'design_system' ),
			items: PanelMenu.createGroupItems( 'global', [ 'colors', 'typography' ] ),
		},
		{
			name: 'theme_style',
			title: elementor.translate( 'theme_style' ),
			items: PanelMenu.createGroupItems( 'theme-style', [ 'typography', 'buttons', 'images', 'form-fields' ] ),
		},
		{
			name: 'settings',
			title: elementor.translate( 'settings' ),
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
