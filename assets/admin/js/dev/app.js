/* global ElementorConfig */
var App;

App = Marionette.Application.extend( {
	helpers: require( 'elementor-utils/helpers' ),
	heartbeat: require( 'elementor-utils/heartbeat' ),
	schemes: require( 'elementor-utils/schemes' ),
	presetsFactory: require( 'elementor-utils/presets-factory' ),
	modals: require( 'elementor-utils/modals' ),
	introduction: require( 'elementor-utils/introduction' ),

	// Channels
	editor: Backbone.Radio.channel( 'ELEMENTOR:editor' ),
	data: Backbone.Radio.channel( 'ELEMENTOR:data' ),
	filterState: Backbone.Radio.channel( 'ELEMENTOR:filterState' ),
	elementLibrary: Backbone.Radio.channel( 'ELEMENTOR:elementLibrary' ),
	panelElements: Backbone.Radio.channel( 'ELEMENTOR:panelElements' ),
	dataEditMode: Backbone.Radio.channel( 'ELEMENTOR:editmode' ),
	preview: Backbone.Radio.channel( 'ELEMENTOR:preview' ),
	deviceMode: Backbone.Radio.channel( 'ELEMENTOR:deviceMode' ),

	// Private Members
	_controlsItemView: null,

	getElementData: function( modelElement ) {
		var elType = modelElement.get( 'elType' );

		if ( 'widget' === elType ) {
			var widgetType = modelElement.get( 'widgetType' );

			if ( ! this.config.widgets[ widgetType ] ) {
				return false;
			}

			return this.config.widgets[ widgetType ];
		}

		if ( ! this.config.elements[ elType ] ) {
			return false;
		}

		return this.config.elements[ elType ];
	},

	getElementControls: function( modelElement ) {
		var elementData = this.getElementData( modelElement );

		if ( ! elementData ) {
			return false;
		}

		var elType = modelElement.get( 'elType' ),
			isInner = modelElement.get( 'isInner' );

		if ( 'widget' === elType ) {
			return elementData.controls;
		}

		return _.filter( elementData.controls, function( controlData ) {
			return ! ( isInner && controlData.hide_in_inner || ! isInner && controlData.hide_in_top );
		} );
	},

	getControlItemView: function( controlType ) {
		if ( null === this._controlsItemView ) {
			this._controlsItemView = {
				color: require( 'elementor-views/controls/color' ),
				dimensions: require( 'elementor-views/controls/dimensions' ),
				image_dimensions: require( 'elementor-views/controls/image-dimensions' ),
				media: require( 'elementor-views/controls/media' ),
				slider: require( 'elementor-views/controls/slider' ),
				wysiwyg: require( 'elementor-views/controls/wysiwyg' ),
				choose: require( 'elementor-views/controls/choose' ),
				url: require( 'elementor-views/controls/url' ),
				font: require( 'elementor-views/controls/font' ),
				section: require( 'elementor-views/controls/section' ),
				repeater: require( 'elementor-views/controls/repeater' ),
				wp_widget: require( 'elementor-views/controls/wp_widget' ),
				icon: require( 'elementor-views/controls/icon' ),
				gallery: require( 'elementor-views/controls/gallery' ),
				select2: require( 'elementor-views/controls/select2' ),
				box_shadow: require( 'elementor-views/controls/box-shadow' ),
				structure: require( 'elementor-views/controls/structure' ),
				animation: require( 'elementor-views/controls/animation' ),
				hover_animation: require( 'elementor-views/controls/animation' )
			};

			this.editor.trigger( 'editor:controls:initialize' );
		}

		return this._controlsItemView[ controlType ] || require( 'elementor-views/controls/base' );
	},

	getPanelView: function() {
		return this.getRegion( 'panel' ).currentView;
	},

	initDialogsManager: function() {
		this.dialogsManager = new DialogsManager.Instance();
	},

	onStart: function() {
		NProgress.start();
		NProgress.inc( 0.2 );

		this.config = ElementorConfig;

		var ElementModel = require( 'elementor-models/element' );

		Backbone.Radio.DEBUG = false;
		Backbone.Radio.tuneIn( 'ELEMENTOR' );

		this.initDialogsManager();

		this.heartbeat.init();

		this.modals.init();

		elementorBindUI.setEditorMode( true );

		// Init Base elements collection from the server
		this.elements = new ElementModel.Collection( this.config.data );

		this.$previewWrapper = Backbone.$( '#elementor-preview' );

		this.$previewResponsiveWrapper = Backbone.$( '#elementor-preview-responsive-wrapper' );

		var previewIframeId = 'elementor-preview-iframe';

		// Make sure the iFrame does not exist.
		if ( ! Backbone.$( '#' + previewIframeId ).length ) {
			var previewIFrame = document.createElement( 'iframe' );

			previewIFrame.id = previewIframeId;
			previewIFrame.src = this.config.preview_link + '&' + ( new Date().getTime() );

			this.$previewResponsiveWrapper.append( previewIFrame );
		}

		this.$preview = Backbone.$( '#' + previewIframeId );
		this.$preview.on( 'load', _.bind( function() {
			this.$previewContents = this.$preview.contents();

			elementorBindUI.setScopeWindow( this.$preview[0].contentWindow );

			this.triggerMethod( 'preview:loaded' );
		}, this ) );

		this.listenTo( this.dataEditMode, 'switch', this.onEditModeSwitched );

		this.setWorkSaver();
	},

	onPreviewLoaded: function() {
		NProgress.done();

		var SectionsCollectionView = require( 'elementor-views/sections' ),
			PanelLayoutView = require( 'elementor-layouts/panel/panel' );

		var $previewElementorEl = this.$previewContents.find( '#elementor' );

		if ( ! $previewElementorEl.length ) {
			this.onPreviewElNotFound();
			return;
		}

		var iframeRegion = new Marionette.Region( {
			// Make sure you get the DOM object out of the jQuery object
			el: $previewElementorEl[0]
		} );

		this.schemes.init();

		this.schemes.printSchemesStyle();

		this.$previewContents.on( 'click', function( event ) {
			var $target = Backbone.$( event.target ),
				editMode = elementor.dataEditMode.request( 'activeMode' ),
				isClickInsideElementor = !! $target.closest( '#elementor' ).length,
				isTargetInsideDocument = this.contains( $target[0] );

			if ( isClickInsideElementor && 'preview' !== editMode || ! isTargetInsideDocument ) {
				return;
			}

			if ( $target.closest( 'a' ).length ) {
				event.preventDefault();
			}

			if ( ! isClickInsideElementor ) {
				elementor.getPanelView().setPage( 'elements' );
			}
		} );

		this.addRegions( {
			sections: iframeRegion,
			panel: '#elementor-panel'
		} );

		this.getRegion( 'sections' ).show( new SectionsCollectionView( {
			collection: this.elements
		} ) );

		this.getRegion( 'panel' ).show( new PanelLayoutView() );

		this.$previewContents
		    .children() // <html>
		    .addClass( 'elementor-html' )
		    .children( 'body' )
		    .addClass( 'elementor-editor-active' );

		this.setResizablePanel();

		Backbone.$( '#elementor-loading' ).fadeOut( 600 );

		this.introduction.startOnLoadIntroduction();
	},

	onEditModeSwitched: function() {
		var activeMode = elementor.dataEditMode.request( 'activeMode' );

		if ( 'preview' === activeMode ) {
			this.enterPreviewMode();
		} else {
			this.exitPreviewMode();
		}
	},

	onPreviewElNotFound: function() {
		var dialog = this.dialogsManager.createWidget( 'alert', {
			headerMessage: elementor.translate( 'preview_el_not_found_header' ),
			message: elementor.translate( 'preview_el_not_found_message' ),
			position: {
				my: 'center center',
				at: 'center center'
			},
			onConfirm: function() {
				parent.history.go( -1 );
			}
		} );

		dialog.show();
	},

	setFlagEditorChange: function( status ) {
		elementor.editor.reply( 'editor:changed', status );
		elementor.editor.trigger( 'editor:changed', status );
	},

	isEditorChanged: function() {
		return ( true === elementor.editor.request( 'editor:changed' ) );
	},

	setWorkSaver: function() {
		Backbone.$( window ).on( 'beforeunload', function() {
			if ( elementor.isEditorChanged() ) {
				return elementor.translate( 'before_unload_alert' );
			}
		} );
	},

	setResizablePanel: function() {
		var self = this,
			side = elementor.config.is_rtl ? 'right' : 'left';

		self.panel.$el.resizable( {
			handles: elementor.config.is_rtl ? 'w' : 'e',
			minWidth: 200,
			maxWidth: 500,
			start: function() {
				self.$previewWrapper
					.addClass( 'ui-resizable-resizing' )
					.css( 'pointer-events', 'none' );
			},
			stop: function() {
				self.$previewWrapper
					.removeClass( 'ui-resizable-resizing' )
					.css( 'pointer-events', '' );

				elementor.data.trigger( 'scrollbar:update' );
			},
			resize: function( event, ui ) {
				self.$previewWrapper
					.css( side, ui.size.width );
			}
		} );
	},

	enterPreviewMode: function() {
		this.$previewContents
		    .find( 'body' )
		    .add( 'body' )
		    .removeClass( 'elementor-editor-active' )
		    .addClass( 'elementor-editor-preview' );

		// Handle panel resize
		this.$previewWrapper.css( elementor.config.is_rtl ? 'right' : 'left', '' );

		this.panel.$el.css( 'width', '' );
	},

	exitPreviewMode: function() {
		this.$previewContents
		    .find( 'body' )
		    .add( 'body' )
		    .removeClass( 'elementor-editor-preview' )
		    .addClass( 'elementor-editor-active' );
	},

	saveBuilder: function( options ) {
		options = _.extend( {
			revision: 'draft',
			onSuccess: null
		}, options );

		NProgress.start();

		return Backbone.$.ajax( {
	        type: 'POST',
	        url: this.config.ajaxurl,
	        data: {
		        action: 'elementor_save_builder',
		        post_id: this.config.post_id,
		        revision: options.revision,
		        data: JSON.stringify( elementor.elements.toJSON() ),
		        _nonce: elementor.config.nonce
	        }
        } )
        .done( function( data ) {
	        NProgress.done();

	        elementor.setFlagEditorChange( false );

	        if ( _.isFunction( options.onSuccess ) ) {
		        options.onSuccess.call( this, data );
	        }
        } );
	},

	translate: function( stringKey, templateArgs ) {
		var string = this.config.i18n[ stringKey ];

		if ( undefined === string ) {
			string = stringKey;
		}

		if ( templateArgs ) {
			string = string.replace( /{(\d+)}/g, function( match, number ) {
				return undefined !== templateArgs[ number ] ? templateArgs[ number ] : match;
			} );
		}

		return string;
	}
} );

module.exports = ( window.elementor = new App() ).start();
