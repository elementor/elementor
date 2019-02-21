module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-footer-content',

	tagName: 'nav',

	id: 'elementor-panel-footer-tools',

	possibleRotateModes: [ 'portrait', 'landscape' ],

	ui: {
		menuButtons: '.elementor-panel-footer-tool',
		settings: '#elementor-panel-footer-settings',
		deviceModeIcon: '#elementor-panel-footer-responsive > i',
		deviceModeButtons: '#elementor-panel-footer-responsive .elementor-panel-footer-sub-menu-item',
		saveTemplate: '#elementor-panel-footer-sub-menu-item-save-template',
		history: '#elementor-panel-footer-history',
		navigator: '#elementor-panel-footer-navigator',
	},

	events: {
		'click @ui.menuButtons': 'onMenuButtonsClick',
		'click @ui.settings': 'onSettingsClick',
		'click @ui.deviceModeButtons': 'onResponsiveButtonsClick',
		'click @ui.saveTemplate': 'onSaveTemplateClick',
		'click @ui.history': 'onHistoryClick',
		'click @ui.navigator': 'onNavigatorClick',
	},

	behaviors: function() {
		var behaviors = {
			saver: {
				behaviorClass: elementor.modules.components.saver.behaviors.FooterSaver,
			},
		};

		return elementor.hooks.applyFilters( 'panel/footer/behaviors', behaviors, this );
	},

	initialize: function() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );

		elementorCommon.route.register( 'panel/page-settings', () => {
			this.showSettingsPage();
		} );
	},

	getDeviceModeButton: function( deviceMode ) {
		return this.ui.deviceModeButtons.filter( '[data-device-mode="' + deviceMode + '"]' );
	},

	addSubMenuItem: function( subMenuName, itemData ) {
		const $newItem = jQuery( '<div>', {
				id: 'elementor-panel-footer-sub-menu-item-' + itemData.name,
				class: 'elementor-panel-footer-sub-menu-item',
			} ),
			$itemIcon = jQuery( '<i>', {
				class: 'elementor-icon ' + itemData.icon,
				'aria-hidden': true,
			} ),
			$itemTitle = jQuery( '<div>', {
				class: 'elementor-title',
			} ).text( itemData.title );

		$newItem.append( $itemIcon, $itemTitle );

		if ( itemData.description ) {
			const $itemDescription = jQuery( '<div>', {
				class: 'elementor-description',
			} ).text( itemData.description );

			$newItem.append( $itemDescription );
		}

		if ( itemData.callback ) {
			$newItem.on( 'click', itemData.callback );
		}

		const $menuTool = this.ui.menuButtons.filter( '#elementor-panel-footer-' + subMenuName );

		if ( itemData.before ) {
			const $beforeItem = $menuTool.find( '#elementor-panel-footer-sub-menu-item-' + itemData.before );

			if ( $beforeItem.length ) {
				return $newItem.insertBefore( $beforeItem );
			}
		}

		const $subMenu = $menuTool.find( '.elementor-panel-footer-sub-menu' );

		return $newItem.appendTo( $subMenu );
	},

	showSettingsPage: function() {
		const panel = elementor.getPanelView();

		this.ui.settings.addClass( 'elementor-open' );

		panel.setPage( 'page_settings' );

		panel.getCurrentPageView().on( 'destroy', () => {
			this.ui.settings.removeClass( 'elementor-open' );
		} );
	},

	onMenuButtonsClick: function( event ) {
		var $tool = jQuery( event.currentTarget );

		// If the tool is not toggleable or the click is inside of a tool
		if ( ! $tool.hasClass( 'elementor-toggle-state' ) || jQuery( event.target ).closest( '.elementor-panel-footer-sub-menu-item' ).length ) {
			return;
		}

		var isOpen = $tool.hasClass( 'elementor-open' );

		this.ui.menuButtons.not( '.elementor-leave-open' ).removeClass( 'elementor-open' );

		if ( ! isOpen ) {
			$tool.addClass( 'elementor-open' );
		}
	},

	onSettingsClick: function() {
		elementorCommon.route.to( 'panel/page-settings' );
	},

	onDeviceModeChange: function() {
		var previousDeviceMode = elementor.channels.deviceMode.request( 'previousMode' ),
			currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' );

		this.getDeviceModeButton( previousDeviceMode ).removeClass( 'active' );

		this.getDeviceModeButton( currentDeviceMode ).addClass( 'active' );

		// Change the footer icon
		this.ui.deviceModeIcon.removeClass( 'eicon-device-' + previousDeviceMode ).addClass( 'eicon-device-' + currentDeviceMode );
	},

	onResponsiveButtonsClick: function( event ) {
		var $clickedButton = this.$( event.currentTarget ),
			newDeviceMode = $clickedButton.data( 'device-mode' );

		elementor.changeDeviceMode( newDeviceMode );
	},

	onSaveTemplateClick: function() {
		elementorCommon.route.to( 'library/save-template' );
	},

	onHistoryClick: function() {
		elementorCommon.route.to( 'panel/history' );
	},

	onNavigatorClick: function() {
		if ( elementor.navigator.isOpen() ) {
			elementor.navigator.close();
		} else {
			elementor.navigator.open();
		}
	},
} );
