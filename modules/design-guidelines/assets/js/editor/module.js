class Module extends elementorModules.editor.utils.Module {
	onInit() {
		const config = window[ 'elementorDesignGuidelinesConfig' ];
		if ( ! config ) {
			return;
		}

		elementor.on( 'preview:loaded', () => {
			let activeKitId = config['activeKitId'];
			if ( elementor.documents.getCurrentId() == activeKitId) {return;}
			// TODO 21/02/2023 : get active kit id from the server.
			// TODO 21/02/2023 : enqueue styles in iframe somehow.
			// elementor.$previewContents.find( 'body' ).append( `<div class="elementor-${activeKitId} elementor-design-guidelines-root" style="position: fixed;z-index: 1;left: 0;top: 0;width: 100%;height: 100%;overflow: auto;background-color: rgb(255, 255, 255);"></div>` );
		} );
		const helper = new EditorHelper();
		$e.components.register( new ColorsComponent( helper, config ) );
		$e.components.register( new FontsComponent( helper, config ) );

	}
}

new Module();



