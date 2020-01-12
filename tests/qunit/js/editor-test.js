import EditorBase from 'elementor-editor/editor-base';

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

	initPreview() {
		this.$preview = jQuery( '#elementor-preview-iframe' );

		jQuery( document ).ready( () => {
			this.$preview.trigger( 'load' );
		} );

		super.initPreview();
	}

	initFrontend() {
		elementorFrontend.init = () => console.log( 'initFrontend' );

		elementorFrontend.elements.$body = jQuery( '#elementor-test' );

		super.initFrontend();
	}

	onPreviewLoaded() {
		this.$preview = jQuery( '#elementor-preview-iframe' );

		this.$preview[ 0 ].contentWindow.elementorFrontend = {
			init: () => console.log( 'elementorFrontend::init' ),
		};

		this.$previewContents = this.$preview.contents();
		this.$previewContents.find( 'body' ).append( '<div id="elementor"></div>' );

		// Shortcut bind, in other words make shortcuts listen to iframe.
		elementorFrontend.elements.$window = jQuery( '#elementor-preview-iframe' );

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

