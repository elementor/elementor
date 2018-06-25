var ControlBaseView;

ControlBaseView = Marionette.CompositeView.extend( {
	ui: function() {
		return {
			controlTitle: '.elementor-control-title'
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

	templateHelpers: function() {
		var controlData = {
			_cid: this.model.cid
		};

		return {
			data: _.extend( {}, this.model.toJSON(), controlData )
		};
	},

	getTemplate: function() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-control-' + this.model.get( 'type' ) + '-content' );
	},

	initialize: function( options ) {
		this.elementSettingsModel = options.elementSettingsModel;

		var controlType = this.model.get( 'type' ),
			controlSettings = jQuery.extend( true, {}, elementor.config.controls[ controlType ], this.model.attributes );

		this.model.set( controlSettings );

		this.listenTo( this.elementSettingsModel, 'change', this.toggleControlVisibility );
	},

	toggleControlVisibility: function() {
		var isVisible = elementor.helpers.isActiveControl( this.model, this.elementSettingsModel.attributes );

		this.$el.toggleClass( 'elementor-hidden-control', ! isVisible );

		elementor.getPanelView().updateScrollbar();
	},

	onRender: function() {
		var layoutType = this.model.get( 'label_block' ) ? 'block' : 'inline',
			showLabel = this.model.get( 'show_label' ),
			elClasses = 'elementor-label-' + layoutType;

		elClasses += ' elementor-control-separator-' + this.model.get( 'separator' );

		if ( ! showLabel ) {
			elClasses += ' elementor-control-hidden-label';
		}

		this.$el.addClass( elClasses );

		this.toggleControlVisibility();
	}
} );

module.exports = ControlBaseView;
