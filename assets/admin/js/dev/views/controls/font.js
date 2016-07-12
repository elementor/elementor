var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlFontItemView;

ControlFontItemView = ControlBaseItemView.extend( {
	onReady: function() {
		this.ui.select.select2( {
			dir: elementor.config.is_rtl ? 'rtl' : 'ltr'
		} );
	},

	templateHelpers: function() {
		var helpers = ControlBaseItemView.prototype.templateHelpers.apply( this, arguments );

		helpers.getFontsByGroups = _.bind( function( groups ) {
			var fonts = this.model.get( 'fonts' ),
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

module.exports = ControlFontItemView;
