var Module = require( 'elementor-utils/module' ),
	PreviewModule;

PreviewModule = Module.extend( {
	dialogsManager: null,

	onInit: function() {
		this.dialogsManager = new DialogsManager.Instance();
	}
} );

module.exports = window.elementorPreview = new PreviewModule();
