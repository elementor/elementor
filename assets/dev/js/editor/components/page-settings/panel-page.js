module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-page-settings',

	template: '#tmpl-elementor-panel-page-settings',

	ui: {
		discard: '.elementor-panel-scheme-discard .elementor-button',
		apply: '.elementor-panel-scheme-save .elementor-button',
		input: ':input',
		sliders: '.elementor-slider'
	},

	events: {
		'click @ui.discard': 'onDiscardClick',
		'click @ui.apply': 'onApplyClick',
		'keyup @ui.input': 'onInputChanged',
		'change @ui.input': 'onInputChanged',
		'slide @ui.sliders': 'onSlideChange'
	},

	manager: null,

	onRender: function() {
		var self = this;
		self.ui.input.each( function() {
			var $this = Backbone.$( this ),
				thisName = $this.attr( 'name' );
			$this.val( self.model.get( thisName ) );
		} );

		self.initSliders();
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

	onSlideChange: function( event, ui ) {
		var name = event.currentTarget.dataset.input,
			$input = this.ui.input.filter( '[name="' + name + '"]' );

		$input.val( ui.value ).trigger( 'change' );
	},

	onInputChanged: function( event ) {
		this.model.set( event.target.name, event.target.value );

		this.ui.sliders.filter( '[data-input="' + event.target.name + '"]' ).slider( 'value', event.target.value );

		this.ui.discard.prop( 'disabled', false );
		this.ui.apply.prop( 'disabled', false );
	},

	onApplyClick: function() {
		var self = this,
			settings = self.model.toJSON();
		elementor.ajax.send( 'save_page_settings', {
			data: settings,
			success: function( data ) {
				elementor.config.page_settings = settings;
				elementorFrontend.getScopeWindow().location.reload();
			},
			error: function( data ) {
				alert( 'An error occurred' );
			}
		} );
	},

	onDiscardClick: function() {
		this.model = this.options.manager.createModel();
		this.render();
		this.ui.discard.prop( 'disabled', true );
		this.ui.apply.prop( 'disabled', true );
	},

	onDestroy: function() {
		this.onDiscardClick();
	}
} );
