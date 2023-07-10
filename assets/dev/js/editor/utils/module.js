const EditorModule = elementorModules.Module.extend( {

	onInit() {
		const $window = jQuery( window );

		$window.on( 'elementor:init-components',
			this.onElementorInitComponents.bind( this ) );

		$window.on( 'elementor:loaded', () => {
			this.onElementorLoaded();

			elementor.on( 'document:loaded', this.onDocumentLoaded.bind( this ) );
		} );

		$window.on( 'elementor:init', this.onElementorReady );
	},

	// TODO: Delete as soon as possible.
	getEditorControlView( name ) {
		const editor = elementor.getPanelView().getCurrentPageView();

		return editor.children.findByModelCid( this.getEditorControlModel( name ).cid );
	},

	// TODO: Delete as soon as possible.
	getEditorControlModel( name ) {
		const editor = elementor.getPanelView().getCurrentPageView();

		return editor.collection.findWhere( { name } );
	},

	onElementorReady() {
		this.onElementorInit();

		elementor
			.on( 'frontend:init', this.onElementorFrontendInit.bind( this ) )
			.on( 'preview:loaded', this.onElementorPreviewLoaded.bind( this ) );
	},
} );

EditorModule.prototype.onElementorLoaded = function() {};

EditorModule.prototype.onElementorInit = function() {};

EditorModule.prototype.onElementorPreviewLoaded = function() {};

EditorModule.prototype.onDocumentLoaded = function() {};

EditorModule.prototype.onElementorFrontendInit = function() {};

EditorModule.prototype.onElementorInitComponents = function() {};

module.exports = EditorModule;
