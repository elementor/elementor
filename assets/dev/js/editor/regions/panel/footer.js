module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-footer-content',

	tagName: 'nav',

	id: 'elementor-panel-footer-tools',

	possibleRotateModes: [ 'portrait', 'landscape' ],

	ui: {
		buttonSave: '#elementor-panel-saver-button-publish, #elementor-panel-saver-menu-save-draft', // TODO: remove. Compatibility for Pro <= 1.9.5
		menuButtons: '.elementor-panel-footer-tool',
		settings: '#elementor-panel-footer-settings',
		deviceModeIcon: '#elementor-panel-footer-responsive > i',
		deviceModeButtons: '#elementor-panel-footer-responsive .elementor-panel-footer-sub-menu-item',
		saveTemplate: '#elementor-panel-saver-menu-save-template',
		history: '#elementor-panel-footer-history',
		navigator: '#elementor-panel-footer-navigator'
	},

	events: {
		'click @ui.menuButtons': 'onMenuButtonsClick',
		'click @ui.settings': 'onSettingsClick',
		'click @ui.deviceModeButtons': 'onResponsiveButtonsClick',
		'click @ui.saveTemplate': 'onSaveTemplateClick',
		'click @ui.history': 'onHistoryClick',
		'click @ui.navigator': 'onNavigatorClick'
	},

	behaviors: function() {
		var behaviors = {
			saver: {
				behaviorClass: elementor.modules.components.saver.behaviors.FooterSaver
			}
		};

		return elementor.hooks.applyFilters( 'panel/footer/behaviors', behaviors, this );
	},

	initialize: function() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
	},

	getDeviceModeButton: function( deviceMode ) {
		return this.ui.deviceModeButtons.filter( '[data-device-mode="' + deviceMode + '"]' );
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
		var self = this;

		if ( 'page_settings' !== elementor.getPanelView().getCurrentPageName() ) {
			elementor.getPanelView().setPage( 'page_settings' );

			elementor.getPanelView().getCurrentPageView().once( 'destroy', function() {
				self.ui.settings.removeClass( 'elementor-open' );
			} );
		}
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
		elementor.templates.startModal( {
			onReady: function() {
				elementor.templates.getLayout().showSaveTemplateView();
			}
		} );
	},

	onHistoryClick: function() {
		if ( 'historyPage' !== elementor.getPanelView().getCurrentPageName() ) {
			elementor.getPanelView().setPage( 'historyPage' );
		}
	},

	onNavigatorClick: function() {
		if ( elementor.navigator.isOpen() ) {
			elementor.navigator.close();
		} else {
			elementor.navigator.open();
		}
	}
} );
