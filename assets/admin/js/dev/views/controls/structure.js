var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	SectionView = require( 'elementor-views/section' ),
	ControlStructureItemView;

ControlStructureItemView = ControlBaseItemView.extend( {

	templateHelpers: function() {
		var helpers = ControlBaseItemView.prototype.templateHelpers.apply( this, arguments );

		helpers.getPresetByStructure = function( structure ) {
			return SectionView.getPresetByStructure( structure );
		};

		helpers.getMorePresets = _.bind( this.getMorePresets, this );

		return helpers;
	},

	getMorePresets: function() {
		var parsedStructure = SectionView.getParsedStructure( this.getControlValue() );

		return SectionView.getPresets( parsedStructure.columnsCount );
	},

	onInputChange: function() {
		this.render();
	}
} );

module.exports = ControlStructureItemView;
