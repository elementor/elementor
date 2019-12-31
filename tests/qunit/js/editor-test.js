import EditorBase from './../../../assets/dev/js/editor/editor-base';

export default class EditorTest extends EditorBase {
	constructor( options ) {
		super( options );

		QUnit.testStart( ( { module, name } ) => {
			console.log( 'Testing: ', module, name );
		} );

		QUnit.testDone( ( { module, name } ) => {
			this.$elementor.empty();
		} );
	}

	getPreviewView() {
		return super.getPreviewView();
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

		elementorFrontend.elements.$body = jQuery( '#elementor-fake' );

		super.initFrontend();
	}

	onPreviewLoaded() {
		this.$preview = jQuery( '#elementor-preview-iframe' );

		this.$preview[ 0 ].contentWindow.elementorFrontend = {
			init: () => console.log( 'elementorFrontend::init' ),
		};

		this.$previewContents = this.$preview.contents();

		const $previewContentsBody = this.$previewContents.find( 'body' );

		$previewContentsBody.append( '<div id="elementor"></div>' );

		this.$elementor = $previewContentsBody.find( '#elementor' );

		// Shortcut bind, in other words make shortcuts listen to iframe.
		elementorFrontend.elements.$window = jQuery( '#elementor-preview-iframe' );

		super.onPreviewLoaded();
	}

	onFirstPreviewLoaded() {
		this.initPanel();

		this.previewLoadedOnce = true;

		// Do nothing, else.
	}

	enqueueTypographyFonts() {
		// Do nothing, bypass parent function.
	}
}

