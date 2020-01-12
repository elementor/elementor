import EditorBase from 'elementor-editor/editor-base';
import config from './editor-config';
import frontend from './frontend';

export default class EditorTest extends EditorBase {
	constructor( options ) {
		super( options );

		QUnit.testStart( ( { module, name } ) => {
			console.log( 'Testing', module, name );

			this.$previewElementorEl.empty();
		} );

		QUnit.testDone( ( { module, name } ) => {
			console.log( 'Done Testing', module, name );
		} );
	}

	getConfig() {
		return config;
	}

	onPreviewLoaded() {
		this.$preview[ 0 ].contentWindow.elementorFrontend = frontend;

		this.$previewContents = this.$preview.contents();
		this.$previewContents.find( 'body' ).append( '<div class="elementor elementor-1"></div>' );

		super.onPreviewLoaded();
	}

	onFirstPreviewLoaded() {
		this.initPanel();

		this.previewLoadedOnce = true;
	}

	enqueueTypographyFonts() {
		// Do nothing, bypass parent function.
	}
}
