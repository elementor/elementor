var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlStructureItemView;

ControlStructureItemView = ControlBaseDataView.extend( {
	ui() {
		var ui = ControlBaseDataView.prototype.ui.apply( this, arguments );

		ui.resetStructure = '.elementor-control-structure-reset';

		return ui;
	},

	events() {
		return _.extend( ControlBaseDataView.prototype.events.apply( this, arguments ), {
			'click @ui.resetStructure': 'onResetStructureClick',
		} );
	},

	templateHelpers() {
		var helpers = ControlBaseDataView.prototype.templateHelpers.apply( this, arguments );

		helpers.getMorePresets = this.getMorePresets.bind( this );

		return helpers;
	},

	getCurrentEditedSection() {
		var editor = elementor.getPanelView().getCurrentPageView();

		return editor.getOption( 'editedElementView' );
	},

	getMorePresets() {
		var parsedStructure = elementor.presetsFactory.getParsedStructure( this.getControlValue() );

		return elementor.presetsFactory.getPresets( parsedStructure.columnsCount );
	},

	onResetStructureClick() {
		this.getCurrentEditedSection().resetColumnsCustomSize();
	},
} );

module.exports = ControlStructureItemView;
