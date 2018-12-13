const EditorModule = elementorModules.Module.extend( {

	onInit: function() {
		jQuery( window ).on( 'elementor:init', this.onElementorReady );
	},

	getEditorControlView: function( name ) {
		const editor = elementor.getPanelView().getCurrentPageView();

		return editor.children.findByModelCid( this.getEditorControlModel( name ).cid );
	},

	getEditorControlModel: function( name ) {
		const editor = elementor.getPanelView().getCurrentPageView();

		return editor.collection.findWhere( { name: name } );
	},

	onElementorReady: function() {
		this.onElementorInit();

		elementor
			.on( 'frontend:init', this.onElementorFrontendInit )
			.on( 'preview:loaded', this.onElementorPreviewLoaded );
	},
} );

EditorModule.prototype.onElementorInit = function() {};

EditorModule.prototype.onElementorPreviewLoaded = function() {};

EditorModule.prototype.onElementorFrontendInit = function() {};

module.exports = EditorModule;
