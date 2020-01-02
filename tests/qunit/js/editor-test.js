import EditorBase from 'elementor-editor/editor-base';

export default class EditorTest extends EditorBase {
	constructor( options ) {
		super( options );

		QUnit.testStart( ( { module, name } ) => {
			console.log( 'Testing', module, name );
		} );

		QUnit.testDone( ( { module, name } ) => {
			console.log( 'Testing done', module, name );

			this.$previewElementorEl.empty();
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

		// Shortcut bind, in other words make shortcuts listen to iframe.
		elementorFrontend.elements.$window = jQuery( '#elementor-preview-iframe' );
	}

	onPreviewLoaded() {
		this.$preview = jQuery( '#elementor-preview-iframe' );

		this.$preview[ 0 ].contentWindow.elementorFrontend = {
			init: () => console.log( 'elementorFrontend::init' ),
		};

		this.$previewContents = this.$preview.contents();

		const $previewContentsBody = this.$previewContents.find( 'body' );

		$previewContentsBody.append( '<div id="elementor"></div>' );

		this.$previewElementorEl = $previewContentsBody.find( '#elementor' );

		this.initFrontend();

		this.initElements();

		const iframeRegion = new Marionette.Region( {
			// Make sure you get the DOM object out of the jQuery object
			el: this.$previewElementorEl[ 0 ],
		} );

		this.onFirstPreviewLoaded();

		this.addRegions( {
			sections: iframeRegion,
		} );

		const Preview = require( 'elementor-views/preview' );

		this.sections.show( new Preview( { model: this.elementsModel } ) );

		this.trigger( 'preview:loaded', ! this.loaded /* isFirst */ );

		this.loaded = true;
	}

	onFirstPreviewLoaded() {
		this.initPanel();

		this.previewLoadedOnce = true;
	}
}
