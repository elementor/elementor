const EditorModule = elementorModules.Module.extend( {

	onInit: function() {
		const $window = jQuery( window );

		$window.on( 'elementor:init-components',
			this.onElementorInitComponents.bind( this ) );

		$window.on( 'elementor:init', this.onElementorReady );
	},

	// TODO: Delete as soon as possible.
	getEditorControlView: function( name ) {
		const editor = elementor.getPanelView().getCurrentPageView();

		return editor.children.findByModelCid( this.getEditorControlModel( name ).cid );
	},

	// TODO: Delete as soon as possible.
	getEditorControlModel: function( name ) {
		const editor = elementor.getPanelView().getCurrentPageView();

		return editor.collection.findWhere( { name: name } );
	},

	onElementorReady: function() {
		this.onElementorInit();

		elementor
			.on( 'frontend:init', this.onElementorFrontendInit.bind( this ) )
			.on( 'preview:loaded', this.onElementorPreviewLoaded.bind( this ) );
	},
} );

EditorModule.prototype.onElementorInit = function() {};

EditorModule.prototype.onElementorPreviewLoaded = function() {};

EditorModule.prototype.onElementorFrontendInit = function() {};

EditorModule.prototype.onElementorInitComponents = function() {};

module.exports = EditorModule;
