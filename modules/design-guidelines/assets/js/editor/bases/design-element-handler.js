export default class DesignElementHandler {
	constructor( editorHelper, config ) {
		this.config = config;
		this.helper = editorHelper;
		this.selectors = {};
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
		const selector = this.selectors[ name ];
		return this.getSelectorPrefix() + selector;
	}

	getSelectorPrefix() {
		return 'design-guidelines-';
	}
}
