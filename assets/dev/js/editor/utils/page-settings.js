var ViewModule = require( 'elementor-utils/view-module' ),
	Stylesheet = require( 'elementor-editor-utils/stylesheet' );

module.exports = ViewModule.extend( {
	stylesheet: null,

	$stylesheetElement: null,

	initStylesheet: function() {
		this.stylesheet = new Stylesheet();
	},

	renderStyles: function() {
		var contentWidth = this.getSettings( 'content_width' );

		this.stylesheet.addRules( '.elementor-section.elementor-section-boxed > .elementor-container', { 'max-width': contentWidth + 'px' } );
	},

	updateStylesheet: function() {
		this.renderStyles();

		this.addStyleToDocument();
	},

	addStyleToDocument: function() {
		var styleText = this.stylesheet.toString();

		if ( _.isEmpty( styleText ) && ! this.$stylesheetElement ) {
			return;
		}

		if ( ! this.$stylesheetElement ) {
			this.createStylesheetElement();
		}

		elementor.$previewContents.find( 'head' ).append( this.$stylesheetElement );

		this.$stylesheetElement.text( styleText );
	},

	createStylesheetElement: function() {
		this.$stylesheetElement = Backbone.$( '<style>' );
	},

	bindEvents: function() {
		elementor.on( 'preview:loaded', this.updateStylesheet );
	},

	onInit: function() {
		this.setSettings( elementor.config.page_settings );

		this.initStylesheet();

		ViewModule.prototype.onInit.apply( this, arguments );
	}
} );
