module.exports = Marionette.Behavior.extend( {

	introductionViewed: false,

	ui: {
		editButton: '.elementor-editor-element-edit'
	},

	events: {
		'click @ui.editButton': 'show'
	},

	initialize: function() {
		this.initDialog();
	},

	initDialog: function() {
		var dialog;

		this.getDialog = function() {
			if ( ! dialog ) {
				dialog = elementor.dialogsManager.createWidget( 'buttons', {
					className: 'elementor-introduction',
					headerMessage: elementor.translate( 'meet_right_click_header' ),
					message: elementor.translate( 'meet_right_click_message' ),
					iframe: elementor.$preview,
					position: {
						my: 'center top+5',
						at: 'center bottom',
						collision: 'fit'
					},
					effects: {
						hide: 'hide',
						show: 'show'
					},
					hide: {
						onBackgroundClick: false
					}
				} );

				dialog.addButton( {
					name: 'learn-more',
					text: elementor.translate( 'learn_more' ),
					tag: 'div',
					callback: function() {
						open( elementor.config.help_right_click_url, '_blank' );
					}
				} );

				dialog.addButton( {
					name: 'ok',
					text: elementor.translate( 'got_it' ),
					callback: this.setIntroductionViewed.bind( this )
				} );

				dialog.getElements( 'ok' ).addClass( 'elementor-button elementor-button-success' );
			}

			return dialog;
		};
	},

	show: function( event ) {
		if ( this.introductionViewed ) {
			return;
		}

		var dialog = this.getDialog();

		dialog.setSettings( 'position', {
			of: event.currentTarget
		} );

		dialog.show();
	},

	setIntroductionViewed: function() {
		this.introductionViewed = true;

		elementor.ajax.addRequest( 'introduction_viewed' );
	}
} );
