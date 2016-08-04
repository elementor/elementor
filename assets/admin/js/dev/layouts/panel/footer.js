var PanelFooterItemView;

PanelFooterItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-footer-content',

	tagName: 'nav',

	id: 'elementor-panel-footer-tools',

	defaultDeviceMode: 'desktop',

	currentDeviceMode: '',

	possibleRotateModes: [ 'portrait', 'landscape' ],

	ui: {
		menuButtons: '.elementor-panel-footer-tool',
		deviceModeButtons: '#elementor-panel-footer-responsive .elementor-panel-footer-sub-menu-item',
		buttonSave: '#elementor-panel-footer-save',
		buttonSaveButton: '#elementor-panel-footer-save .elementor-button',
		buttonPublish: '#elementor-panel-footer-publish',
		watchTutorial: '#elementor-panel-footer-watch-tutorial'
	},

	events: {
		'click @ui.deviceModeButtons': 'onClickResponsiveButtons',
		'click @ui.buttonSave': 'onClickButtonSave',
		'click @ui.buttonPublish': 'onClickButtonPublish',
		'click @ui.watchTutorial': 'onClickWatchTutorial'
	},

	initialize: function() {
		this._initDialog();

		Backbone.$( document ).on( 'click', _.bind( this.onDocumentClick, this ) );

		this.listenTo( elementor.editor, 'editor:changed', this.onEditorChanged );
	},

	_initDialog: function() {
		var dialog;

		this.getDialog = function() {
			if ( ! dialog ) {
				var $ = Backbone.$,
					$dialogMessage = $( '<div>', {
						'class': 'elementor-dialog-message'
					} ),
					$messageIcon = $( '<i>', {
						'class': 'fa fa-check-circle'
					} ),
					$messageText = $( '<div>', {
						'class': 'elementor-dialog-message-text'
					} ).text( elementor.translate( 'saved' ) );

				$dialogMessage.append( $messageIcon, $messageText );

				dialog = elementor.dialogsManager.createWidget( 'popup', {
					hide: {
						delay: 1500
					}
				} );

				dialog.setMessage( $dialogMessage );
			}

			return dialog;
		};
	},

	_publishBuilder: function() {
		var self = this;

		var options = {
			revision: 'publish',
			onSuccess: function() {
				self.getDialog().show();

				self.ui.buttonSaveButton.removeClass( 'elementor-button-state' );
			}
		};

		self.ui.buttonSaveButton.addClass( 'elementor-button-state' );

		elementor.saveBuilder( options );
	},

	_saveBuilderDraft: function() {
		elementor.saveBuilder();
	},

	onRender: function() {
		this.changeDeviceMode( this.defaultDeviceMode );
	},

	changeDeviceMode: function( newDeviceMode ) {
		if ( this.currentDeviceMode === newDeviceMode ) {
			return;
		}

		this.getCurrentDeviceModeButton().removeClass( 'active' );

		elementor.$previewWrapper
		    .removeClass( 'elementor-device-' + this.currentDeviceMode )
		    .addClass( 'elementor-device-' + newDeviceMode );

		this.currentDeviceMode = newDeviceMode;

		this.getCurrentDeviceModeButton().addClass( 'active' );

		elementor.deviceMode.reply( 'currentMode', this.currentDeviceMode );
		elementor.deviceMode.trigger( 'change' );
	},

	getCurrentDeviceModeButton: function() {
		return this.ui.deviceModeButtons.filter( '[data-device-mode="' + this.currentDeviceMode + '"]' );
	},

	onDocumentClick: function( event ) {
		var $target = Backbone.$( event.target ),
			isClickInsideOfTool = $target.closest( '.elementor-panel-footer-sub-menu-wrapper' ).length;

		if ( isClickInsideOfTool ) {
			return;
		}

		var $tool = $target.closest( '.elementor-panel-footer-tool' ),
			isClosedTool = $tool.length && ! $tool.hasClass( 'elementor-open' );

		this.ui.menuButtons.removeClass( 'elementor-open' );

		if ( isClosedTool ) {
			$tool.addClass( 'elementor-open' );
		}
	},

	onEditorChanged: function() {
		this.ui.buttonSave.toggleClass( 'elementor-save-active', elementor.isEditorChanged() );
	},

	onClickButtonSave: function() {
		//this._saveBuilderDraft();
		this._publishBuilder();
	},

	onClickButtonPublish: function( event ) {
		// Prevent click on save button
		event.stopPropagation();

		this._publishBuilder();
	},

	onClickResponsiveButtons: function( event ) {
		var $clickedButton = this.$( event.currentTarget ),
			newDeviceMode = $clickedButton.data( 'device-mode' );

		this.changeDeviceMode( newDeviceMode );
	},

	onClickWatchTutorial: function() {
		elementor.introduction.startIntroduction();
	}
} );

module.exports = PanelFooterItemView;
