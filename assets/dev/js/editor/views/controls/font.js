var ControlSelect2View = require( 'elementor-views/controls/select2' );

module.exports = ControlSelect2View.extend( {
	getSelect2Options: function() {
		return {
			dir: elementor.config.is_rtl ? 'rtl' : 'ltr'
		};
	},

	templateHelpers: function() {
		var helpers = ControlSelect2View.prototype.templateHelpers.apply( this, arguments );

		helpers.getFontsByGroups = _.bind( function( groups ) {
			var fonts = this.model.get( 'options' ),
				filteredFonts = {};

			_.each( fonts, function( fontType, fontName ) {
				if ( _.isArray( groups ) && _.contains( groups, fontType ) || fontType === groups ) {
					filteredFonts[ fontName ] = fontType;
				}
			} );

			return filteredFonts;
		}, this );

		return helpers;
	}
} );
