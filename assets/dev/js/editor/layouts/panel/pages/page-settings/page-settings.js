var SettingsModel = require( './model' );

module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-page-settings',

	template: '#tmpl-elementor-panel-page-settings',

	ui: {
		discard: '.elementor-panel-scheme-discard .elementor-button',
		apply: '.elementor-panel-scheme-save .elementor-button',
		input: '.elementor-panel-box :input',
		sliders: '.elementor-slider'
	},

	events: {
		'click @ui.discard': 'onDiscardClick',
		'click @ui.apply': 'onApplyClick',
		'keyup @ui.input': 'onInputChange',
		'change @ui.input': 'onInputChange',
		'slide @ui.sliders': 'onSlideChange'
	},

	initialize: function() {
		this.model = new SettingsModel();

		this.initModel();
	},

	initModel: function() {
		this.model.set( elementor.pageSettings.getSettings( 'savedSettings' ) );
	},

	initSliders: function() {
		var self = this;

		self.ui.sliders.each( function() {
			var $slider = Backbone.$( this ),
				$input = $slider.next( '.elementor-slider-input' ).find( 'input' );

			$slider.slider( {
				value: $input.val(),
				min: +$input.attr( 'min' ),
				max: +$input.attr( 'max' )
			} );
		} );
	},

	onRender: function() {
		var self = this;

		self.ui.input.each( function() {
			var $this = Backbone.$( this );

			$this.val( self.model.get( this.name ) );
		} );

		self.initSliders();
	},

	onSlideChange: function( event, ui ) {
		var name = event.currentTarget.dataset.input,
			$input = this.ui.input.filter( '[name="' + name + '"]' );

		$input.val( ui.value ).trigger( 'change' );
	},

	onInputChange: function( event ) {
		this.model.set( event.target.name, event.target.value );

		this.ui.sliders.filter( '[data-input="' + event.target.name + '"]' ).slider( 'value', event.target.value );

		this.ui.discard.prop( 'disabled', false );

		this.ui.apply.prop( 'disabled', false );
	},

	onApplyClick: function() {
		var self = this,
			settings = self.model.toJSON();

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
		this.initModel();

		this.render();

		this.ui.discard.prop( 'disabled', true );

		this.ui.apply.prop( 'disabled', true );
	}
} );
