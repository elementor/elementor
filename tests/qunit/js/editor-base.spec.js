import EditorBase from './../../../assets/dev/js/editor/editor-base';

export default class EditorBaseTest extends EditorBase {
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

		this.$previewContents.find( 'body' ).append( '<div id="elementor"></div>' );

		// Shortcut bind.
		elementorFrontend.elements.$window = jQuery( '#elementor-preview-iframe' );

		super.onPreviewLoaded();
	}

	onFirstPreviewLoaded() {
		this.initPanel();
		// do nothing
		this.previewLoadedOnce = true;
	}

	enqueueTypographyFonts() {

	}
}

