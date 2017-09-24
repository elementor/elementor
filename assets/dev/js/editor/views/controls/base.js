var ControlBaseItemView;

ControlBaseItemView = Marionette.CompositeView.extend( {
	ui: function() {
		return {
			input: 'input[data-setting][type!="checkbox"][type!="radio"]',
			checkbox: 'input[data-setting][type="checkbox"]',
			radio: 'input[data-setting][type="radio"]',
			select: 'select[data-setting]',
			textarea: 'textarea[data-setting]',
			controlTitle: '.elementor-control-title',
			responsiveSwitchers: '.elementor-responsive-switcher'
		};
	},

	behaviors: function() {
		var behaviors = {};

		return elementor.hooks.applyFilters( 'controls/base/behaviors', behaviors, this );
	},

	getBehavior: function( name ) {
		return this._behaviors[ Object.keys( this.behaviors() ).indexOf( name ) ];
	},

	className: function() {
		// TODO: Any better classes for that?
		var classes = 'elementor-control elementor-control-' + this.model.get( 'name' ) + ' elementor-control-type-' + this.model.get( 'type' ),
			modelClasses = this.model.get( 'classes' ),
			responsive = this.model.get( 'responsive' );

		if ( ! _.isEmpty( modelClasses ) ) {
			classes += ' ' + modelClasses;
		}

		if ( ! _.isEmpty( responsive ) ) {
			classes += ' elementor-control-responsive-' + responsive.max;
		}

		return classes;
	},

	getTemplate: function() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-control-' + this.model.get( 'type' ) + '-content' );
	},

	templateHelpers: function() {
		var controlData = {
			controlValue: this.getControlValue(),
			_cid: this.model.cid
		};

		return {
			data: _.extend( {}, this.model.toJSON(), controlData )
		};
	},

	baseEvents: {
		'input @ui.input': 'onBaseInputChange',
		'change @ui.checkbox': 'onBaseInputChange',
		'change @ui.radio': 'onBaseInputChange',
		'input @ui.textarea': 'onBaseInputChange',
		'change @ui.select': 'onBaseInputChange',
		'click @ui.responsiveSwitchers': 'onSwitcherClick'
	},

	childEvents: {},

	events: function() {
		return _.extend( {}, this.baseEvents, this.childEvents );
	},

	initialize: function( options ) {
		this.elementSettingsModel = options.elementSettingsModel;

		var controlType = this.model.get( 'type' ),
			controlSettings = Backbone.$.extend( true, {}, elementor.config.controls[ controlType ], this.model.attributes );

		this.model.set( controlSettings );

		this.listenTo( this.elementSettingsModel, 'change', this.toggleControlVisibility )
			.listenTo( this.elementSettingsModel, 'change:external:' + this.model.get( 'name' ), this.onSettingsExternalChange );
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
		this.applySavedValue();

		var layoutType = this.model.get( 'label_block' ) ? 'block' : 'inline',
			showLabel = this.model.get( 'show_label' ),
			elClasses = 'elementor-label-' + layoutType;

		elClasses += ' elementor-control-separator-' + this.model.get( 'separator' );

		if ( ! showLabel ) {
			elClasses += ' elementor-control-hidden-label';
		}

		this.$el.addClass( elClasses );

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
		var device = Backbone.$( event.currentTarget ).data( 'device' );

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

	toggleControlVisibility: function() {
		var isVisible = elementor.helpers.isActiveControl( this.model, this.elementSettingsModel.attributes );

		this.$el.toggleClass( 'elementor-hidden-control', ! isVisible );

		elementor.channels.data.trigger( 'scrollbar:update' );
	},

	onReady: function() {},

	onAfterExternalChange: function() {
		this.hideTooltip();
		this.render();
	},

	addTooltip: function() {
		// Create tooltip on controls
		this.$( '.tooltip-target' ).tipsy( {
			gravity: function() {
				// `n` for down, `s` for up
				var gravity = Backbone.$( this ).data( 'tooltip-pos' );

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

module.exports = ControlBaseItemView;
