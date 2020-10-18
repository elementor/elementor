import EditorBase from 'elementor-editor/editor-base';
import config from './config';
import frontend from './frontend';

export default class EditorTest extends EditorBase {
	constructor( options ) {
		super( options );

		QUnit.testStart( ( { module, name } ) => {
			if ( this.$previewElementorEl ) {
				this.$previewElementorEl.empty();
			}

			if ( QUnit.config.showUI ) {
				// eslint-disable-next-line no-console
				console.log( `Test: ${ module } -> ${ name }` );
			}
		} );

		QUnit.testDone( ( { module, name } ) => {
			if ( QUnit.config.showUI ) {
				// eslint-disable-next-line no-console
				console.log( `Done: ${ module } -> ${ name }` );
			}
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
