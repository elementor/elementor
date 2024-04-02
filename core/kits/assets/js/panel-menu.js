import MenuPageView from 'elementor-panel/pages/menu/base';

export default class PanelMenu extends MenuPageView {
	initialize() {
		this.collection = PanelMenu.getGroups();
	}
}

PanelMenu.groups = null;

PanelMenu.createGroupItems = ( groupName ) => {
	const tabs = $e.components.get( 'panel/global' ).getTabs(),
		groupTabs = Object.entries( tabs ).filter( ( [ , tabConfig ] ) => groupName === tabConfig.group ),
		queryString = window.location.search,
		urlParams = new URLSearchParams( queryString ),
		givenActiveTab = urlParams.get( 'active_tab' );

	let actualActiveTab = null;
	setTimeout( updateTabParam );

	return groupTabs.map( ( [ tabId, tabConfig ] ) => {
		if ( givenActiveTab === tabId ) {
			actualActiveTab = givenActiveTab;
		}

		return {
			name: tabId,
			icon: tabConfig.icon,
			title: tabConfig.title,
			callback: () => $e.route( 'panel/global/' + tabId ),
		};
	} );

	function updateTabParam() {
		if ( actualActiveTab ) {
			$e.route( 'panel/global/' + actualActiveTab );
		}

		_replaceParam( 'active_tab', '' );
	}
};

PanelMenu.initGroups = () => {
	const settingsItems = PanelMenu.createGroupItems( 'settings' ),
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
			items: PanelMenu.createGroupItems( 'global' ),
		},
		{
			name: 'theme_style',
			title: __( 'Theme Style', 'elementor' ),
			items: PanelMenu.createGroupItems( 'theme-style' ),
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

function _replaceParam( key, value = null ) {
	const url = new URL( window.location.href );

	if ( value ) {
		url.searchParams.set( key, value );
	} else {
		url.searchParams.delete( key );
	}

	history.pushState( null, '', url.toString() );
}
