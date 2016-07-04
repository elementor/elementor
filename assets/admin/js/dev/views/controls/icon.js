var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlIconItemView;

ControlIconItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.iconSelect = '.elementor-control-icon';

		return ui;
	},

	initialize: function() {
		ControlBaseItemView.prototype.initialize.apply( this, arguments );

		this.filterIcons();
	},

	filterIcons: function() {
		var icons = this.model.get( 'icons' ),
			include = this.model.get( 'include' ),
			exclude = this.model.get( 'exclude' );

		if ( include ) {
			var filteredIcons = {};

			_.each( include, function( iconKey ) {
				filteredIcons[ iconKey ] = icons[ iconKey ];
			} );

			this.model.set( 'icons', filteredIcons );
			return;
		}

		if ( exclude ) {
			_.each( exclude, function( iconKey ) {
				delete icons[ iconKey ];
			} );
		}
	},

	iconsList: function( icon ) {
		if ( ! icon.id ) {
			return icon.text;
		}

		return Backbone.$(
			'<span><i class="' + icon.id + '"></i> ' + icon.text + '</span>'
		);
	},

	getFieldTitleValue: function() {
		var controlValue = this.getControlValue();

		return controlValue.replace( /^fa fa-/, '' ).replace( '-', ' ' );
	},

	onReady: function() {
		this.ui.iconSelect.select2( {
			allowClear: true,
			templateResult: _.bind( this.iconsList, this ),
			templateSelection: _.bind( this.iconsList, this )
		} );
	},

	onBeforeDestroy: function() {
		if ( this.ui.iconSelect.data( 'select2' ) ) {
			this.ui.iconSelect.select2( 'destroy' );
		}
		this.$el.remove();
	}
} );

module.exports = ControlIconItemView;
