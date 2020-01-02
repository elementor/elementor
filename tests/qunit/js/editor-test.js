import EditorBase from 'elementor-editor/editor-base';
import EditorElementor from 'elementor-editor/editor-elementor';

export default class EditorTest extends EditorElementor {
	constructor( options ) {
		super( options );

		QUnit.testStart( ( { module, name } ) => {
			console.log( 'Testing', module, name );
		} );

		QUnit.testDone( ( { module, name } ) => {
			console.log( 'Testing done', module, name );

			this.$elementor.empty();
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
	}

	onStart( options ) {
		const NProgress = {
			done: () => console.log( 'NProgress::done()' ),
		};

		window.NProgress = NProgress;

		// Call editor-base, used to disable NProgress.
		EditorBase.prototype.onStart.call( this, options );
	}

	enqueueTypographyFonts() {
		// Bypass editor-base.
	}
}
