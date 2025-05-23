var ControlSelect2View = require( 'elementor-controls/select2' ),
	ControlIconView;

ControlIconView = ControlSelect2View.extend( {

	initialize() {
		ControlSelect2View.prototype.initialize.apply( this, arguments );

		this.filterIcons();
	},

	filterIcons() {
		const icons = this.model.get( 'options' ),
			include = this.model.get( 'include' );

		if ( include ) {
			var filteredIcons = {};

			_.each( include, function( iconKey ) {
				filteredIcons[ iconKey ] = icons[ iconKey ];
			} );

			this.model.set( 'options', filteredIcons );
			return;
		}

		const exclude = this.model.get( 'exclude' );
		if ( exclude ) {
			_.each( exclude, function( iconKey ) {
				delete icons[ iconKey ];
			} );
		}
	},

	iconsList( icon ) {
		if ( ! icon.id ) {
			return icon.text;
		}

		return jQuery(
			'<span><i class="' + icon.id + '"></i> ' + icon.text + '</span>',
		);
	},

	getSelect2Options() {
		return {
			allowClear: true,
			templateResult: this.iconsList.bind( this ),
			templateSelection: this.iconsList.bind( this ),
		};
	},
} );

module.exports = ControlIconView;
