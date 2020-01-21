/* global ElementorConfig */
import editorBase from './../../../assets/dev/js/editor/editor-base';

const App = editorBase.extend();

window.elementor = new App( {
	$previewContents: jQuery( document ),

	getPreviewView: function() {
		if ( ! this.previewLoaded ) {
			var iframeRegion = new Marionette.Region( {
				// Make sure you get the DOM object out of the jQuery object
				el: document.querySelector( '#elementor-preview-iframe' ),
			} );

			this.addRegions( {
				sections: iframeRegion,
			} );

			this.initElements();

			this.initPanel();

			var Preview = require( 'elementor-views/preview' );

			this.sections.show( new Preview( { model: this.elementsModel } ) );

			this.previewLoaded = true;
		}

		return this.sections.currentView;
	},

	onStart: function() {
		this.config = ElementorConfig;

		Backbone.Radio.DEBUG = false;

		Backbone.Radio.tuneIn( 'ELEMENTOR' );

		this.initComponents();

		if ( ! this.checkEnvCompatibility() ) {
			this.onEnvNotCompatible();
		}

		this.setAjax();

		this.requestWidgetsConfig();

		this.channels.dataEditMode.reply( 'activeMode', 'edit' );

		this.listenTo( this.channels.dataEditMode, 'switch', this.onEditModeSwitched );

		this.initClearPageDialog();

		this.addBackgroundClickArea( document );

		elementorCommon.elements.$window.trigger( 'elementor:init' );

		this.initPreview();

		this.logSite();
	},
} );

module.exports = elementor;
