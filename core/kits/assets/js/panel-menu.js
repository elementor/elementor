import MenuPageView from 'elementor-panel/pages/menu/base';

export default class PanelMenu extends MenuPageView {
	initialize() {
		this.collection = PanelMenu.getGroups();
	}
}

PanelMenu.groups = null;

PanelMenu.createGroupItems = ( groupName ) => {
	const tabs = $e.components.get( 'panel/global' ).getTabs(),
		groupTabs = Object.entries( tabs ).filter( ( [ tabId, tabConfig ] ) => groupName === tabConfig.group );

	return groupTabs.map( ( [ tabId, tabConfig ] ) => {
		return {
			name: tabId,
			icon: tabConfig.icon,
			title: tabConfig.title,
			callback: () => $e.route( 'panel/global/' + tabId ),
		};
	} );
};

PanelMenu.initGroups = () => {
	const settingsItems = PanelMenu.createGroupItems( 'settings' ),
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
			items: PanelMenu.createGroupItems( 'global' ),
		},
		{
			name: 'theme_style',
			title: elementor.translate( 'theme_style' ),
			items: PanelMenu.createGroupItems( 'theme-style' ),
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
