var ControlSelect2View = require( 'elementor-controls/select2' );

module.exports = ControlSelect2View.extend( {
	getSelect2Options: function() {
		return {
			dir: elementor.config.is_rtl ? 'rtl' : 'ltr'
		};
	},

	templateHelpers: function() {
		var helpers = ControlSelect2View.prototype.templateHelpers.apply( this, arguments ),
			fonts = this.model.get( 'options' ),
			self = this,
			fontGroups = this.model.get( 'groups' );

		helpers.getFontsByGroups = function( groups ) {
			var filteredFonts = {};

			_.each( fonts, function( fontType, fontName ) {
				if ( _.isArray( groups ) && _.contains( groups, fontType ) || fontType === groups ) {
					filteredFonts[ fontName ] = fontName;
				}
			} );

			return filteredFonts;
		};

		helpers.getFontGroupsData = function () {
			if ( fontGroups ) {
				return fontGroups;
			}

			var getGroupFonts = function( group ) {
				var groupFonts = {};
				_.each( fonts, function( fontType, fontName ) {
					if ( fontType === group ) {
						groupFonts[ fontName ] = fontName;
					}
				} );
				return groupFonts;
			};

			var groups = _.uniq( _.values( fonts) ),
				fontGroups = [];
			_.each( groups, function( group ) {
				fontGroups[group] = {
					options: getGroupFonts( group ),
					label: group
				};
			});
			self.model.set( 'groups', fontGroups );
			return fontGroups;

		};

		return helpers;
	}
} );
