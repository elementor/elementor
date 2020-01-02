import EditorBase from './editor-base';

const DEFAULT_DEVICE_MODE = 'desktop';

export class Editor extends EditorBase {
	onStart( options ) {
		NProgress.start();
		NProgress.inc( 0.2 );

		super.onStart( options );
	}

	onPreviewLoaded() {
		NProgress.done();

		const previewWindow = this.$preview[ 0 ].contentWindow;

		if ( ! previewWindow.elementorFrontend ) {
			this.onPreviewLoadingError();

			return;
		}

		this.$previewContents = this.$preview.contents();
		this.$previewElementorEl = this.$previewContents.find( '#elementor' );

		if ( ! this.$previewElementorEl.length ) {
			this.onPreviewElNotFound();

			return;
		}

		this.initFrontend();

		this.initElements();

		const iframeRegion = new Marionette.Region( {
			// Make sure you get the DOM object out of the jQuery object
			el: this.$previewElementorEl[ 0 ],
		} );

		this.schemes.init();
		this.schemes.printSchemesStyle();

		this.preventClicksInsideEditor();

		this.addBackgroundClickArea( elementorFrontend.elements.window.document );

		if ( this.previewLoadedOnce ) {
			$e.route( 'panel/elements/categories' );
		} else {
			this.onFirstPreviewLoaded();
		}

		this.addRegions( {
			sections: iframeRegion,
		} );

		const Preview = require( 'elementor-views/preview' );

		this.sections.show( new Preview( { model: this.elementsModel } ) );

		this.$previewContents.children().addClass( 'elementor-html' );

		const $frontendBody = elementorFrontend.elements.$body;

		$frontendBody.addClass( 'elementor-editor-active' );

		if ( ! elementor.userCan( 'design' ) ) {
			$frontendBody.addClass( 'elementor-editor-content-only' );
		}

		this.changeDeviceMode( DEFAULT_DEVICE_MODE );

		jQuery( '#elementor-loading, #elementor-preview-loading' ).fadeOut( 600 );

		_.defer( function() {
			elementorFrontend.elements.window.jQuery.holdReady( false );
		} );

		this.enqueueTypographyFonts();

		this.onEditModeSwitched();

		$e.shortcuts.bindListener( elementorFrontend.elements.$window );

		this.trigger( 'preview:loaded', ! this.loaded /* isFirst */ );

		this.loaded = true;
	}
}

window.elementor = new Editor();

elementor.start();
