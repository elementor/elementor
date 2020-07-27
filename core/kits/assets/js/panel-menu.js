import MenuPageView from 'elementor-panel/pages/menu/base';

export default class PanelMenu extends MenuPageView {
	initialize() {
		this.collection = PanelMenu.getGroups();
	}

	onBeforeShow() {
		$e.run( 'panel/global/open' );
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
			items: PanelMenu.createGroupItems( 'settings', [ 'site-identity', 'background', 'layout', 'lightbox', 'custom-css' ] ),
		},
	] );
};

PanelMenu.getGroups = () => {
	if ( ! PanelMenu.groups ) {
		PanelMenu.initGroups();
	}

	return PanelMenu.groups;
};
