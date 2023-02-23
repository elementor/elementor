export default class PreviewElementHandler {
	constructor( editorHelper, config ) {
		this.config = config;
		this.helper = editorHelper;
		this.selectors = config['selectors'];
	}

	bindEvents() {
		elementor.on( 'document:loaded', async ( document ) => {
			if ( document.id !== parseInt( this.config[ 'postId' ] ) ) {
				return;
			}

			this.applyChanges( document );
		} );
	}

	applyChanges( document, config ) {
		//empty
	}

	getSelector( name ) {
		return this.selectors[ name ];
	}
}
