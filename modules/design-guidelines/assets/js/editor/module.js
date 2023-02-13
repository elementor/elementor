import Colors from './design-elements/colors';
import Fonts from "./design-elements/fonts";
import EditorHelper from "./utils/editorHelper";

class Module {
	constructor() {
		this.config = window[ 'elementorDesignGuidelinesConfig' ];

		if ( ! this.config ) {
			return;
		}

		elementor.on( 'document:loaded', async ( document ) => {
			if ( document.id !== parseInt( this.config[ 'postId' ] ) ) {
				return;
			}

			const helper = new EditorHelper();
			new Colors( helper ).applyChanges( document, this.config );
			new Fonts( helper ).applyChanges( document, this.config );
		} );
	}
}

new Module();

