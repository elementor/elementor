var ControlBaseView = require( 'elementor-controls/base' ),
	ControlBaseDataView;

ControlBaseDataView = ControlBaseView.extend( {
	ui: function() {
		var ui = ControlBaseView.prototype.ui.apply( this, arguments );

		_.extend( ui, {
			input: 'input[data-setting][type!="checkbox"][type!="radio"]',
			checkbox: 'input[data-setting][type="checkbox"]',
			radio: 'input[data-setting][type="radio"]',
			select: 'select[data-setting]',
			textarea: 'textarea[data-setting]',
			responsiveSwitchers: '.elementor-responsive-switcher'
		} );

		return ui;
	},

	templateHelpers: function() {
		var controlData = ControlBaseView.prototype.templateHelpers.apply( this, arguments );

		controlData.data.controlValue = this.getControlValue();

		return controlData;
	},

	events: function() {
		return {
			'input @ui.input': 'onBaseInputChange',
			'change @ui.checkbox': 'onBaseInputChange',
			'change @ui.radio': 'onBaseInputChange',
			'input @ui.textarea': 'onBaseInputChange',
			'change @ui.select': 'onBaseInputChange',
			'click @ui.responsiveSwitchers': 'onSwitcherClick'
		};
	},

	initialize: function( options ) {
		ControlBaseView.prototype.initialize.apply( this, arguments );

		this.listenTo( this.elementSettingsModel, 'change:external:' + this.model.get( 'name' ), this.onSettingsExternalChange );
	},

	getControlValue: function() {
		return this.elementSettingsModel.get( this.model.get( 'name' ) );
	},

	setValue: function( value ) {
		this.setSettingsModel( value );
	},

	setSettingsModel: function( value ) {
		this.elementSettingsModel.set( this.model.get( 'name' ), value );

		this.triggerMethod( 'settings:change' );
	},

	applySavedValue: function() {
		this.setInputValue( '[data-setting="' + this.model.get( 'name' ) + '"]', this.getControlValue() );
	},

	getEditSettings: function( setting ) {
		var settings = this.getOption( 'elementEditSettings' ).toJSON();

		if ( setting ) {
			return settings[ setting ];
		}

		return settings;
	},

	setEditSetting: function( settingKey, settingValue ) {
		var settings = this.getOption( 'elementEditSettings' );

		settings.set( settingKey, settingValue );
	},

	getInputValue: function( input ) {
		var $input = this.$( input ),
			inputValue = $input.val(),
			inputType = $input.attr( 'type' );

		if ( -1 !== [ 'radio', 'checkbox' ].indexOf( inputType ) ) {
			return $input.prop( 'checked' ) ? inputValue : '';
		}

		if ( 'number' === inputType && _.isFinite( inputValue ) ) {
			return +inputValue;
		}

		// Temp fix for jQuery (< 3.0) that return null instead of empty array
		if ( 'SELECT' === input.tagName && $input.prop( 'multiple' ) && null === inputValue ) {
			inputValue = [];
		}

		return inputValue;
	},

	setInputValue: function( input, value ) {
		var $input = this.$( input ),
			inputType = $input.attr( 'type' );

		if ( 'checkbox' === inputType ) {
			$input.prop( 'checked', !! value );
		} else if ( 'radio' === inputType ) {
			$input.filter( '[value="' + value + '"]' ).prop( 'checked', true );
		} else {
			$input.val( value );
		}
	},

	onSettingsError: function() {
		this.$el.addClass( 'elementor-error' );
	},

	onSettingsChange: function() {
		this.$el.removeClass( 'elementor-error' );
	},

	onRender: function() {
		ControlBaseView.prototype.onRender.apply( this, arguments );

		this.applySavedValue();

		this.renderResponsiveSwitchers();

		this.triggerMethod( 'ready' );

		this.toggleControlVisibility();

		this.addTooltip();
	},

	onBaseInputChange: function( event ) {
		var input = event.currentTarget,
			value = this.getInputValue( input ),
			validators = this.elementSettingsModel.validators[ this.model.get( 'name' ) ];

		if ( validators ) {
			var oldValue = this.getControlValue();

			var isValidValue = validators.every( function( validator ) {
				return validator.isValid( value, oldValue );
			} );

			if ( ! isValidValue ) {
				this.setInputValue( input, oldValue );

				return;
			}
		}

		this.updateElementModel( value, input );

		this.triggerMethod( 'input:change', event );
	},

	onSwitcherClick: function( event ) {
		var device = jQuery( event.currentTarget ).data( 'device' );

		elementor.changeDeviceMode( device );

		this.triggerMethod( 'responsive:switcher:click', device );
	},

	onSettingsExternalChange: function() {
		this.applySavedValue();
		this.triggerMethod( 'after:external:change' );
	},

	renderResponsiveSwitchers: function() {
		if ( _.isEmpty( this.model.get( 'responsive' ) ) ) {
			return;
		}

		var templateHtml = Marionette.Renderer.render( '#tmpl-elementor-control-responsive-switchers', this.model.attributes );

		this.ui.controlTitle.after( templateHtml );
	},

	onAfterExternalChange: function() {
		this.hideTooltip();
		this.render();
	},

	addTooltip: function() {
		// Create tooltip on controls
		this.$( '.tooltip-target' ).tipsy( {
			gravity: function() {
				// `n` for down, `s` for up
				var gravity = jQuery( this ).data( 'tooltip-pos' );

				if ( undefined !== gravity ) {
					return gravity;
				} else {
					return 'n';
				}
			},
			title: function() {
				return this.getAttribute( 'data-tooltip' );
			}
		} );
	},

	hideTooltip: function() {
		jQuery( '.tipsy' ).hide();
	},

	updateElementModel: function( value ) {
		this.setValue( value );
	}
}, {
	// Static methods
	getStyleValue: function( placeholder, controlValue ) {
		return controlValue;
	}
} );

module.exports = ControlBaseDataView;
