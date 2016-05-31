var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlStructureItemView;

ControlStructureItemView = ControlBaseItemView.extend( {

	templateHelpers: function() {
		var helpers = ControlBaseItemView.prototype.templateHelpers.apply( this, arguments );

		helpers.getMorePresets = _.bind( this.getMorePresets, this );

		return helpers;
	},

	getMorePresets: function() {
		var parsedStructure = elementor.presetsFactory.getParsedStructure( this.getControlValue() );

		return elementor.presetsFactory.getPresets( parsedStructure.columnsCount );
	},

	onInputChange: function() {
		var editor = elementor.getPanelView().getCurrentPageView(),
			currentEditedSection = editor.getOption( 'editedElementView' );

		currentEditedSection.redefineLayout();

		this.render();
	}
} );

module.exports = ControlStructureItemView;
