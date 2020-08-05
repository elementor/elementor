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
			tab = tabs[ fullKey ],
			item = {
				name: fullKey,
				icon: tab.icon,
				title: tab.title,
			};

		if ( ! 'additional-settings' === key ) {
			item.callback = () => $e.route( 'panel/global/' + fullKey );
		}

		return item;
	} );
};

PanelMenu.initGroups = () => {
	const settingsItems = PanelMenu.createGroupItems( 'settings', [ 'site-identity', 'background', 'layout', 'lightbox', 'custom-css', 'additional-settings' ] ),
		additionalSettingsProps = {
			type: 'link',
			link: '/wp-admin/admin.php?page=elementor',
			newTab: true,
		};

	settingsItems[ settingsItems.length - 1 ] = jQuery.extend( settingsItems[ settingsItems.length - 1 ], additionalSettingsProps );

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
