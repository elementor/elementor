var ControlsStack = require( 'elementor-views/controls-stack' );

module.exports = ControlsStack.extend( {
	id: 'elementor-panel-page-settings',

	template: '#tmpl-elementor-panel-page-settings',

	childViewContainer: '#elementor-panel-page-settings-controls',

	ui: function() {
		return _.extend(
			ControlsStack.prototype.ui.apply( this, arguments ),
			{
				discard: '.elementor-panel-scheme-discard .elementor-button',
				apply: '.elementor-panel-scheme-save .elementor-button'
			}
		);
	},

	events: function() {
		return _.extend(
			ControlsStack.prototype.events.apply( this, arguments ),
			{
				'click @ui.discard': 'onDiscardClick',
				'click @ui.apply': 'onApplyClick'
			}
		);
	},

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model
		};
	},

	initialize: function() {
		this.model = elementor.pageSettings.model;

		this.collection = new Backbone.Collection( _.values( this.model.controls ) );
	},

	onChildviewSettingsChange: function() {
		this.ui.discard.prop( 'disabled', false );

		this.ui.apply.prop( 'disabled', false );
	},

	onApplyClick: function() {
		var self = this,
			settings = self.model.toJSON();

		settings.id = elementor.config.post_id;

		NProgress.start();

		elementor.ajax.send( 'save_page_settings', {
			data: settings,
			success: function() {
				elementor.pageSettings.setSettings( 'savedSettings', settings );

				elementorFrontend.getScopeWindow().location.reload();

				elementor.once( 'preview:loaded', function() {
					NProgress.done();

					elementor.getPanelView().setPage( 'settingsPage' );
				} );
			},
			error: function() {
				alert( 'An error occurred' );
			}
		} );
	},

	onDiscardClick: function() {
		elementor.pageSettings.resetModel();

		this.render();

		this.ui.discard.prop( 'disabled', true );

		this.ui.apply.prop( 'disabled', true );
	}
} );
