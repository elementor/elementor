(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
				structure: require( 'elementor-views/controls/structure' )
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

		if ( this.schemes.isSchemesEnabled() ) {
			this.schemes.printSchemesStyle();
		}

		this.$previewContents.on( 'click', function( event ) {
			var $target = Backbone.$( event.target ),
				editMode = elementor.dataEditMode.request( 'get:active:mode' ),
				isClickInsideElementor = !! $target.closest( '#elementor' ).length;

			if ( isClickInsideElementor && 'preview' !== editMode ) {
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

		Backbone.$( '#elementor-loading' ).fadeOut( 600 );

		this.introduction.startOnLoadIntroduction();
	},

	onEditModeSwitched: function() {
		var activeMode = elementor.dataEditMode.request( 'get:active:mode' );

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

	enterPreviewMode: function() {
		this.$previewContents
		    .find( 'body' )
		    .add( 'body' )
		    .removeClass( 'elementor-editor-active' )
		    .addClass( 'elementor-editor-preview' );
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
		        data: JSON.stringify( elementor.elements.toJSON() )
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

},{"elementor-layouts/panel/panel":31,"elementor-models/element":34,"elementor-utils/heartbeat":38,"elementor-utils/helpers":39,"elementor-utils/introduction":40,"elementor-utils/modals":41,"elementor-utils/presets-factory":42,"elementor-utils/schemes":43,"elementor-views/controls/base":48,"elementor-views/controls/choose":49,"elementor-views/controls/color":50,"elementor-views/controls/dimensions":51,"elementor-views/controls/font":52,"elementor-views/controls/gallery":53,"elementor-views/controls/icon":54,"elementor-views/controls/image-dimensions":55,"elementor-views/controls/media":56,"elementor-views/controls/repeater":58,"elementor-views/controls/section":59,"elementor-views/controls/select2":60,"elementor-views/controls/slider":61,"elementor-views/controls/structure":62,"elementor-views/controls/url":63,"elementor-views/controls/wp_widget":64,"elementor-views/controls/wysiwyg":65,"elementor-views/sections":68}],2:[function(require,module,exports){
var HandleAddDuplicateBehavior;

HandleAddDuplicateBehavior = Marionette.Behavior.extend( {

	onChildviewClickNew: function( childView ) {
		var currentIndex = childView.$el.index() + 1;

		this.addChild( { at: currentIndex } );
	},

	onRequestNew: function() {
		this.addChild();
	},

	addChild: function( options ) {
		if ( this.view.isCollectionFilled() ) {
			return;
		}

		options = options || {};

		var newItem = {
			id: elementor.helpers.getUniqueID(),
			elType: this.view.getChildType()[0],
			settings: {},
			elements: []
		};

		this.view.addChildModel( newItem, options );
	}
} );

module.exports = HandleAddDuplicateBehavior;

},{}],3:[function(require,module,exports){
var HandleElementsRelation;

HandleElementsRelation = Marionette.Behavior.extend( {

	onRequestAdd: function( itemData, options ) {
		this._addChildElement( itemData, options );
	},

	/**
	 *
	 * @param {Object} itemData
	 * @param {Object} options
	 * @private
	 */
	_addChildElement: function( itemData, options ) {
		options = options || {};

		var myChildType = this.view.getChildType();

		if ( -1 === myChildType.indexOf( itemData.elType ) ) {
			delete options.at;

			this.view.children.last().triggerMethod( 'request:add', itemData, options );

			return;
		}

		var newModel = this.view.addChildModel( itemData, options ),
			newView = this.view.children.findByModel( newModel );

		if ( 'section' === newView.getElementType() && newView.isInner() ) {
			newView.addEmptyColumn();
		}

		newView.triggerMethod( 'open:editor' );
	}
} );

module.exports = HandleElementsRelation;

},{}],4:[function(require,module,exports){
var HandleDuplicateBehavior;

HandleDuplicateBehavior = Marionette.Behavior.extend( {

	onChildviewClickDuplicate: function( childView ) {
		if ( this.view.isCollectionFilled() ) {
			return;
		}

		var currentIndex = this.view.collection.indexOf( childView.model ),
			newModel = childView.model.clone();

		this.view.addChildModel( newModel, { at: currentIndex } );
	}
} );

module.exports = HandleDuplicateBehavior;

},{}],5:[function(require,module,exports){
var HandleEditModeBehavior;

HandleEditModeBehavior = Marionette.Behavior.extend( {
	initialize: function() {
		this.listenTo( elementor.dataEditMode, 'switch', this.onEditModeSwitched );
	},

	onEditModeSwitched: function() {
		var activeMode = elementor.dataEditMode.request( 'get:active:mode' );

		this.view.$el.toggleClass( 'elementor-active-mode', 'preview' !== activeMode );
	},

	onRender: function() {
		this.onEditModeSwitched();
	}
} );

module.exports = HandleEditModeBehavior;

},{}],6:[function(require,module,exports){
var HandleEditorBehavior;

HandleEditorBehavior = Marionette.Behavior.extend( {

	onClickEdit: function() {
		var activeMode = elementor.dataEditMode.request( 'get:active:mode' );

		if ( 'preview' === activeMode ) {
			return;
		}

		this.onOpenEditor();
	},

	onOpenEditor: function() {
		var currentPanelPageName = elementor.getPanelView().getCurrentPageName();

		if ( 'editor' === currentPanelPageName ) {
			var currentPanelPageView = elementor.getPanelView().getCurrentPageView(),
				currentEditableModel = currentPanelPageView.model;

			if ( currentEditableModel === this.view.model ) {
				return;
			}
		}

		var elementData = elementor.getElementData( this.view.model );

		elementor.getPanelView().setPage( 'editor', elementor.translate( 'edit_element', [ elementData.title ] ), {
			model: this.view.model,
			editedElementView: this.view
		} );
	}
} );

module.exports = HandleEditorBehavior;

},{}],7:[function(require,module,exports){
var ResizableBehavior;

ResizableBehavior = Marionette.Behavior.extend( {
	defaults: {
		handles: elementor.config.is_rtl ? 'w' : 'e'
	},

	ui: {
		columnTitle: '.column-title'
	},

	events: {
		'resizestart': 'onResizeStart',
		'resizestop': 'onResizeStop',
		'resize': 'onResize'
	},

	initialize: function() {
		Marionette.Behavior.prototype.initialize.apply( this, arguments );

		this.listenTo( elementor.dataEditMode, 'switch', this.onEditModeSwitched );
	},

	active: function() {
		var options = _.clone( this.options );

		delete options.behaviorClass;

		var $childViewContainer = this.getChildViewContainer(),
			defaultResizableOptions = {},
			resizableOptions = _.extend( defaultResizableOptions, options );

		$childViewContainer.resizable( resizableOptions );
	},

	deactivate: function() {
		if ( this.getChildViewContainer().resizable( 'instance' ) ) {
			this.getChildViewContainer().resizable( 'destroy' );
		}
	},

	onEditModeSwitched: function() {
		var activeMode = elementor.dataEditMode.request( 'get:active:mode' );

		if ( 'preview' !== activeMode ) {
			this.active();
		} else {
			this.deactivate();
		}
	},

	onRender: function() {
		// Call this method from other thread (non-block UI)
		_.defer( _.bind( this.onEditModeSwitched, this ) );
	},

	onDestroy: function() {
		this.deactivate();
	},

	onResizeStart: function( event, ui ) {
		//this.ui.columnTitle.fadeIn( 'fast' );
	},

	onResizeStop: function( event, ui ) {
		//this.ui.columnTitle.fadeOut( 'fast' );
	},

	onResize: function( event, ui ) {
		event.stopPropagation();

		this.view.triggerMethod( 'request:resize', ui );
	},

	getChildViewContainer: function() {
		//if ( 'function' === typeof this.view.getChildViewContainer ) {
		//	// CompositeView
		//	return this.view.getChildViewContainer( this.view );
		//} else {
		//	// CollectionView
		//	return this.$el;
		//}
		return this.$el;
	}
} );

module.exports = ResizableBehavior;

},{}],8:[function(require,module,exports){
var SortableBehavior;

SortableBehavior = Marionette.Behavior.extend( {
	defaults: {
		elChildType: 'widget'
	},

	events: {
		'sortstart': 'onSortStart',
		'sortreceive': 'onSortReceive',
		'sortupdate': 'onSortUpdate',
		'sortstop': 'onSortStop',
		'sortover': 'onSortOver',
		'sortout': 'onSortOut'
	},

	initialize: function() {
		this.listenTo( elementor.dataEditMode, 'switch', this.onEditModeSwitched );
		this.listenTo( elementor.deviceMode, 'change', this.onDeviceModeChange );
	},

	onEditModeSwitched: function() {
		var activeMode = elementor.dataEditMode.request( 'get:active:mode' );

		if ( 'preview' !== activeMode ) {
			this.active();
		} else {
			this.deactivate();
		}
	},

	onDeviceModeChange: function() {
		var deviceMode = elementor.deviceMode.request( 'currentMode' );

		if ( 'desktop' === deviceMode ) {
			this.active();
		} else {
			this.deactivate();
		}
	},

	onRender: function() {
		_.defer( _.bind( this.onEditModeSwitched, this ) );
	},

	onDestroy: function() {
		this.deactivate();
	},

	active: function() {
		if ( this.getChildViewContainer().sortable( 'instance' ) ) {
			return;
		}

		var $childViewContainer = this.getChildViewContainer(),
			defaultSortableOptions = {
				connectWith: $childViewContainer.selector,
				cursor: 'move',
				placeholder: 'elementor-sortable-placeholder',
				cursorAt: {
					top: 20,
					left: 25
				},
				helper: _.bind( this._getSortableHelper, this )
			},
			sortableOptions = _.extend( defaultSortableOptions, this.view.getSortableOptions() );

		$childViewContainer.sortable( sortableOptions );
	},

	_getSortableHelper: function( event, $item ) {
		var model = this.view.collection.get( {
			cid: $item.data( 'model-cid' )
		} );

		return '<div style="height: 84px; width: 125px;" class="elementor-sortable-helper elementor-sortable-helper-' + model.get( 'elType' ) + '"><div class="icon"><i class="eicon-' + model.getIcon() + '"></i></div><div class="elementor-element-title-wrapper"><div class="title">' + model.getTitle() + '</div></div></div>';
	},

	deactivate: function() {
		if ( this.getChildViewContainer().sortable( 'instance' ) ) {
			this.getChildViewContainer().sortable( 'destroy' );
		}
	},

	onSortStart: function( event, ui ) {
		event.stopPropagation();

		var model = this.view.collection.get( {
			cid: ui.item.data( 'model-cid' )
		} );

		if ( 'column' === this.options.elChildType ) {
			// the following code is just for touch
			ui.placeholder.addClass( 'elementor-column' );

			var uiData = ui.item.data( 'sortableItem' ),
				uiItems = uiData.items,
				itemHeight = 0;

			uiItems.forEach( function( item ) {
				if ( item.item[0] === ui.item[0] ) {
					itemHeight = item.height;
					return false;
				}
			} );

			ui.placeholder.height( itemHeight );

			// ui.placeholder.addClass( 'elementor-column elementor-col-' + model.getSetting( 'size' ) );
		}

		elementor.data.trigger( model.get( 'elType' ) + ':drag:start' );

		elementor.data.reply( 'cache:' + model.cid, model );
	},

	onSortOver: function( event, ui ) {
		event.stopPropagation();

		var model = elementor.data.request( 'cache:' + ui.item.data( 'model-cid' ) );

		Backbone.$( event.target )
			.addClass( 'elementor-draggable-over' )
			.attr( {
				'data-dragged-element': model.get( 'elType' ),
				'data-dragged-is-inner': model.get( 'isInner' )
			} );

		this.$el.addClass( 'elementor-dragging-on-child' );
	},

	onSortOut: function( event ) {
		event.stopPropagation();

		Backbone.$( event.target )
			.removeClass( 'elementor-draggable-over' )
			.removeAttr( 'data-dragged-element data-dragged-is-inner' );

		this.$el.removeClass( 'elementor-dragging-on-child' );
	},

	onSortReceive: function( event, ui ) {
		event.stopPropagation();

		if ( this.view.isCollectionFilled() ) {
			Backbone.$( ui.sender ).sortable( 'cancel' );
			return;
		}

		var model = elementor.data.request( 'cache:' + ui.item.data( 'model-cid' ) ),
			draggedElType = model.get( 'elType' ),
			draggedIsInnerSection = 'section' === draggedElType && model.get( 'isInner' ),
			targetIsInnerColumn = 'column' === this.view.getElementType() && this.view.isInner();

		if ( draggedIsInnerSection && targetIsInnerColumn ) {
			Backbone.$( ui.sender ).sortable( 'cancel' );
			return;
		}

		var newIndex = ui.item.parent().children().index( ui.item ),
			newModel = new this.view.collection.model( model.toJSON( { copyHtmlCache: true } ) );

		this.view.addChildModel( newModel, { at: newIndex } );

		elementor.data.trigger( draggedElType + ':drag:end' );

		model.destroy();
	},

	onSortUpdate: function( event, ui ) {
		event.stopPropagation();

		var model = this.view.collection.get( ui.item.attr( 'data-model-cid' ) );
		if ( model ) {
			elementor.data.trigger( model.get( 'elType' ) + ':drag:end' );
		}
	},

	onSortStop: function( event, ui ) {
		event.stopPropagation();

		var $childElement = ui.item,
			collection = this.view.collection,
			model = collection.get( $childElement.attr( 'data-model-cid' ) ),
			newIndex = $childElement.parent().children().index( $childElement );

		if ( this.getChildViewContainer()[0] === ui.item.parent()[0] ) {
			if ( null === ui.sender && model ) {
				var oldIndex = collection.indexOf( model );

				if ( oldIndex !== newIndex ) {
					collection.remove( model, { silent: true } );
					collection.add( model, { silent: true, at: newIndex } );

					elementor.setFlagEditorChange( true );
				}

				elementor.data.trigger( model.get( 'elType' ) + ':drag:end' );
			}
		}
	},

	onAddChild: function( view ) {
		view.$el.attr( 'data-model-cid', view.model.cid );
	},

	getChildViewContainer: function() {
		if ( 'function' === typeof this.view.getChildViewContainer ) {
			// CompositeView
			return this.view.getChildViewContainer( this.view );
		} else {
			// CollectionView
			return this.$el;
		}
	}
} );

module.exports = SortableBehavior;

},{}],9:[function(require,module,exports){
var EditModeItemView;

EditModeItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-mode-switcher-content',

	id: 'elementor-mode-switcher-inner',

	ui: {
		previewButton: '#elementor-mode-switcher-preview-input',
		previewLabel: '#elementor-mode-switcher-preview',
		previewLabelA11y: '#elementor-mode-switcher-preview .elementor-screen-only'
	},

	events: {
		'change @ui.previewButton': 'onEditModeChange'
	},

	getCurrentMode: function() {
		return this.ui.previewButton.is( ':checked' ) ? 'preview' : 'edit';
	},

	setMode: function( mode ) {
		this.ui.previewButton.prop( 'checked', 'preview' === mode );
	},

	onRender: function() {
		this.onEditModeChange();
	},

	onEditModeChange: function() {
		var oldEditMode = elementor.dataEditMode.request( 'get:active:mode' ),
			currentMode = this.getCurrentMode();

		elementor.dataEditMode.reply( 'get:active:mode', currentMode );

		if ( currentMode !== oldEditMode ) {
			elementor.dataEditMode.trigger( 'switch' );

			var title = 'preview' === currentMode ? 'Back to Editor' : 'Preview';

			this.ui.previewLabel.attr( 'title', title );
			this.ui.previewLabelA11y.text( title );
		}
	}
} );

module.exports = EditModeItemView;

},{}],10:[function(require,module,exports){
var PanelFooterItemView;

PanelFooterItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-footer-content',

	tagName: 'nav',

	id: 'elementor-panel-footer-tools',

	defaultDeviceMode: 'desktop',

	currentDeviceMode: '',

	possibleRotateModes: [ 'portrait', 'landscape' ],

	ui: {
		menuButtons: '.elementor-panel-footer-tool',
		deviceModeButtons: '#elementor-panel-footer-responsive .elementor-panel-footer-sub-menu-item',
		buttonSave: '#elementor-panel-footer-save',
		buttonSaveButton: '#elementor-panel-footer-save .elementor-button',
		buttonPublish: '#elementor-panel-footer-publish',
		watchTutorial: '#elementor-panel-footer-watch-tutorial'
	},

	events: {
		'click @ui.deviceModeButtons': 'onClickResponsiveButtons',
		'click @ui.buttonSave': 'onClickButtonSave',
		'click @ui.buttonPublish': 'onClickButtonPublish',
		'click @ui.watchTutorial': 'onClickWatchTutorial'
	},

	initialize: function() {
		this._initDialog();

		Backbone.$( document ).on( 'click', _.bind( this.onDocumentClick, this ) );

		this.listenTo( elementor.editor, 'editor:changed', this.onEditorChanged );
	},

	_initDialog: function() {
		var dialog;

		this.getDialog = function() {
			if ( ! dialog ) {
				var $ = Backbone.$,
					$dialogMessage = $( '<div>', {
						'class': 'elementor-dialog-message'
					} ),
					$messageIcon = $( '<i>', {
						'class': 'fa fa-check-circle'
					} ),
					$messageText = $( '<div>', {
						'class': 'elementor-dialog-message-text'
					} ).text( elementor.translate( 'saved' ) );

				$dialogMessage.append( $messageIcon, $messageText );

				dialog = elementor.dialogsManager.createWidget( 'popup', {
					hide: {
						delay: 1500
					}
				} );

				dialog.setMessage( $dialogMessage );
			}

			return dialog;
		};
	},

	_publishBuilder: function() {
		var self = this;

		var options = {
			revision: 'publish',
			onSuccess: function() {
				self.getDialog().show();

				self.ui.buttonSaveButton.removeClass( 'elementor-button-state' );
			}
		};

		self.ui.buttonSaveButton.addClass( 'elementor-button-state' );

		elementor.saveBuilder( options );
	},

	_saveBuilderDraft: function() {
		elementor.saveBuilder();
	},

	onRender: function() {
		this.changeDeviceMode( this.defaultDeviceMode );
	},

	changeDeviceMode: function( newDeviceMode ) {
		if ( this.currentDeviceMode === newDeviceMode ) {
			return;
		}

		this.getCurrentDeviceModeButton().removeClass( 'active' );

		elementor.$previewWrapper
		    .removeClass( 'elementor-device-' + this.currentDeviceMode )
		    .addClass( 'elementor-device-' + newDeviceMode );

		this.currentDeviceMode = newDeviceMode;

		this.getCurrentDeviceModeButton().addClass( 'active' );

		elementor.deviceMode.reply( 'currentMode', this.currentDeviceMode );
		elementor.deviceMode.trigger( 'change' );
	},

	getCurrentDeviceModeButton: function() {
		return this.ui.deviceModeButtons.filter( '[data-device-mode="' + this.currentDeviceMode + '"]' );
	},

	onDocumentClick: function( event ) {
		var $target = Backbone.$( event.target ),
			isClickInsideOfTool = $target.closest( '.elementor-panel-footer-sub-menu-wrapper' ).length;

		if ( isClickInsideOfTool ) {
			return;
		}

		var $tool = $target.closest( '.elementor-panel-footer-tool' ),
			isClosedTool = $tool.length && ! $tool.hasClass( 'elementor-open' );

		this.ui.menuButtons.removeClass( 'elementor-open' );

		if ( isClosedTool ) {
			$tool.addClass( 'elementor-open' );
		}
	},

	onEditorChanged: function() {
		this.ui.buttonSave.toggleClass( 'elementor-save-active', elementor.isEditorChanged() );
	},

	onClickButtonSave: function() {
		//this._saveBuilderDraft();
		this._publishBuilder();
	},

	onClickButtonPublish: function( event ) {
		// Prevent click on save button
		event.stopPropagation();

		this._publishBuilder();
	},

	onClickResponsiveButtons: function( event ) {
		var $clickedButton = this.$( event.currentTarget ),
			newDeviceMode = $clickedButton.data( 'device-mode' );

		this.changeDeviceMode( newDeviceMode );
	},

	onClickWatchTutorial: function() {
		elementor.introduction.startIntroduction();
	}
} );

module.exports = PanelFooterItemView;

},{}],11:[function(require,module,exports){
var PanelHeaderItemView;

PanelHeaderItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-header',

	id: 'elementor-panel-header',

	ui: {
		menuButton: '#elementor-panel-header-menu-button',
		title: '#elementor-panel-header-title',
		addButton: '#elementor-panel-header-add-button'
	},

	events: {
		'click @ui.addButton': 'onClickAdd',
		'click @ui.menuButton': 'onClickMenu'
	},

	setTitle: function( title ) {
		this.ui.title.html( title );
	},

	onClickAdd: function() {
		elementor.getPanelView().setPage( 'elements' );
	},

	onClickMenu: function() {
		var panel = elementor.getPanelView(),
			currentPanelPageName = panel.getCurrentPageName(),
			nextPage = 'menu' === currentPanelPageName ? 'elements' : 'menu';

		panel.setPage( nextPage );
	}
} );

module.exports = PanelHeaderItemView;

},{}],12:[function(require,module,exports){
var EditorCompositeView;

EditorCompositeView = Marionette.CompositeView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-editor-content' ),

	id: 'elementor-panel-page-editor',

	templateHelpers: function() {
		return {
			elementData: elementor.getElementData( this.model )
		};
	},

	childViewContainer: 'div.elementor-controls',

	modelEvents: {
		'destroy': 'onModelDestroy'
	},

	ui: {
		'tabs': '.elementor-tabs-controls li'
	},

	events: {
		'click @ui.tabs a': 'onClickTabControl'
	},

	getChildView: function( item ) {
		var controlType = item.get( 'type' );
		return elementor.getControlItemView( controlType );
	},

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model.get( 'settings' ),
			elementEditSettings: this.model.get( 'editSettings' )
		};
	},

	onDestroy: function() {
		this.getOption( 'editedElementView' ).$el.removeClass( 'elementor-element-editable' );
		this.model.trigger( 'editor:close' );

		this.triggerMethod( 'editor:destroy' );
	},

	onBeforeRender: function() {
		var controls = elementor.getElementControls( this.model.get( 'settings' ) );

		if ( ! controls ) {
			throw new Error( 'No found editor controls' );
		}

		// Create new instance of that collection
		this.collection = new Backbone.Collection( controls );
	},

	onRender: function() {
		this.getOption( 'editedElementView' ).$el.addClass( 'elementor-element-editable' );

		// Set the first tab as active
		this.ui.tabs.eq( 0 ).find( 'a' ).trigger( 'click' );

		// Create tooltip on controls
		this.$( '.tooltip-target' ).tipsy( {
			gravity: function() {
				// `n` for down, `s` for up
				var gravity = Backbone.$( this ).data( 'tooltip-pos' );

				if ( undefined !== gravity ) {
					return gravity;
				} else {
					return 'n';
				}
			},
			title: function() {
				return this.getAttribute( 'data-tooltip' );
			}
		} );
	},

	onModelDestroy: function() {
		this.destroy();
	},

	onClickTabControl: function( event ) {
		event.preventDefault();

		var $thisTab = this.$( event.target );

		this.ui.tabs.removeClass( 'active' );
		$thisTab.closest( 'li' ).addClass( 'active' );

		this.model.get( 'settings' ).trigger( 'control:switch:tab', $thisTab.data( 'tab' ) );

		this.openFirstSectionInCurrentTab( $thisTab.data( 'tab' ) );
	},

	/**
	 * It's a temp method.
	 *
	 * TODO: Rewrite this method later.
	 */
	openFirstSectionInCurrentTab: function( currentTab ) {
		var openedClass = 'elementor-open',

			childrenUnderSection = this.children.filter( function( view ) {
				return ( ! _.isEmpty( view.model.get( 'section' ) ) );
			} ),

			firstSectionControlView = this.children.filter( function( view ) {
				return ( 'section' === view.model.get( 'type' ) ) && ( currentTab === view.model.get( 'tab' ) );
			} );

		// Check if found any section controls
		if ( _.isEmpty( firstSectionControlView ) ) {
			return;
		}

		firstSectionControlView = firstSectionControlView[0];
		firstSectionControlView.ui.heading.addClass( openedClass );

		_.each( childrenUnderSection, function( view ) {
			if ( view.model.get( 'section' ) !== firstSectionControlView.model.get( 'name' ) ) {
				view.$el.removeClass( openedClass );
				return;
			}

			view.$el.addClass( openedClass );
		} );
	},

	onChildviewControlSectionClicked: function( childView ) {
		var openedClass = 'elementor-open',
			sectionClicked = childView.model.get( 'name' ),
			isSectionOpen = childView.ui.heading.hasClass( openedClass ),

			childrenUnderSection = this.children.filter( function( view ) {
				return ( ! _.isEmpty( view.model.get( 'section' ) ) );
			} );

		this.$( '.elementor-control.elementor-control-type-section .elementor-panel-heading' ).removeClass( openedClass );

		if ( isSectionOpen ) {
			// Close all open sections
			sectionClicked = '';
		} else {
			childView.ui.heading.addClass( openedClass );
		}

		_.each( childrenUnderSection, function( view ) {
			if ( view.model.get( 'section' ) !== sectionClicked ) {
				view.$el.removeClass( openedClass );
				return;
			}

			view.$el.addClass( openedClass );
		} );

		elementor.data.trigger( 'scrollbar:update' );
	}
} );

module.exports = EditorCompositeView;

},{}],13:[function(require,module,exports){
var PanelElementsCategory = require( '../models/element' ),
	PanelElementsCategoriesCollection;

PanelElementsCategoriesCollection = Backbone.Collection.extend( {
	model: PanelElementsCategory
} );

module.exports = PanelElementsCategoriesCollection;

},{"../models/element":16}],14:[function(require,module,exports){
var PanelElementsElementModel = require( '../models/element' ),
	PanelElementsElementsCollection;

PanelElementsElementsCollection = Backbone.Collection.extend( {
	model: PanelElementsElementModel/*,
	comparator: 'title'*/
} );

module.exports = PanelElementsElementsCollection;

},{"../models/element":16}],15:[function(require,module,exports){
var PanelElementsCategoriesCollection = require( './collections/categories' ),
	PanelElementsElementsCollection = require( './collections/elements' ),
	PanelElementsCategoriesView = require( './views/categories' ),
	PanelElementsElementsView = require( './views/elements' ),
	PanelElementsSearchView = require( './views/search' ),
	PanelElementsLayoutView;

PanelElementsLayoutView = Marionette.LayoutView.extend( {
	template: '#tmpl-elementor-panel-elements',

	regions: {
		elements: '#elementor-panel-elements-wrapper',
		search: '#elementor-panel-elements-search-area'
	},

	elementsCollection: null,

	categoriesCollection: null,

	initialize: function() {
		this.listenTo( elementor.panelElements, 'element:selected', this.destroy );
	},

	initElementsCollection: function() {
		var elementsCollection = new PanelElementsElementsCollection(),
			sectionConfig = elementor.config.elements.section;

		elementsCollection.add( {
			title: elementor.translate( 'inner_section' ),
			elType: 'section',
			categories: sectionConfig.categories,
			keywords: sectionConfig.keywords,
			icon: sectionConfig.icon
		} );

		// TODO: Change the array from server syntax, and no need each loop for initialize
		_.each( elementor.config.widgets, function( element, widgetType ) {
			elementsCollection.add( {
				title: element.title,
				elType: 'widget',
				categories: element.categories,
				keywords: element.keywords,
				icon: element.icon,
				widgetType: widgetType
			} );
		} );

		this.elementsCollection = elementsCollection;
	},

	initCategoriesCollection: function() {
		var categories = {};

		this.elementsCollection.each( function( element ) {
			_.each( element.get( 'categories' ), function( category ) {
				if ( ! categories[ category ] ) {
					categories[ category ] = [];
				}

				categories[ category ].push( element );
			} );
		} );

		var categoriesCollection = new PanelElementsCategoriesCollection();

		_.each( elementor.config.elements_categories, function( categoryConfig, categoryName ) {
			if ( ! categories[ categoryName ] ) {
				return;
			}

			categoriesCollection.add( {
				name: categoryName,
				title: categoryConfig.title,
				icon: categoryConfig.icon,
				items: categories[ categoryName ]
			} );
		} );

		this.categoriesCollection = categoriesCollection;
	},

	showCategoriesView: function() {
		this.getRegion( 'elements' ).show( new PanelElementsCategoriesView( { collection: this.categoriesCollection } ) );
	},

	showElementsView: function() {
		this.getRegion( 'elements' ).show( new PanelElementsElementsView( { collection: this.elementsCollection } ) );
	},

	clearSearchInput: function() {
		this.getChildView( 'search' ).clearInput();
	},

	changeFilter: function( filterValue ) {
		elementor.panelElements
			.reply( 'filter:value', filterValue )
			.trigger( 'change' );
	},

	clearFilters: function() {
		this.changeFilter( null );
		this.clearSearchInput();
	},

	onChildviewDragStart: function( childView ) {
		elementor.panelElements.reply( 'element:selected', childView );
	},

	onChildviewChildrenRender: function() {
		this.updateElementsScrollbar();
	},

	onChildviewSearchChangeInput: function( child ) {
		var value = child.ui.input.val();

		if ( _.isEmpty( value ) ) {
			this.showCategoriesView();
		} else {
			var oldValue = elementor.panelElements.request( 'filter:value' );

			if ( _.isEmpty( oldValue ) ) {
				this.showElementsView();
			}
		}

		this.changeFilter( value, 'search' );
	},

	onDestroy: function() {
		elementor.panelElements.reply( 'filter:value', null );
	},

	onShow: function() {
		var searchRegion = this.getRegion( 'search' );

		this.initElementsCollection();

		this.initCategoriesCollection();

		this.showCategoriesView();

		searchRegion.show( new PanelElementsSearchView() );
	},

	updateElementsScrollbar: function() {
		elementor.data.trigger( 'scrollbar:update' );
	}
} );

module.exports = PanelElementsLayoutView;

},{"./collections/categories":13,"./collections/elements":14,"./views/categories":17,"./views/elements":20,"./views/search":21}],16:[function(require,module,exports){
var PanelElementsElementModel;

PanelElementsElementModel = Backbone.Model.extend( {
	defaults: {
		title: '',
		categories: [],
		keywords: [],
		icon: '',
		elType: 'widget',
		widgetType: ''
	}
} );

module.exports = PanelElementsElementModel;

},{}],17:[function(require,module,exports){
var PanelElementsCategoryView = require( './category' ),
	PanelElementsCategoriesView;

PanelElementsCategoriesView = Marionette.CollectionView.extend( {
	childView: PanelElementsCategoryView,

	id: 'elementor-panel-elements-categories'
} );

module.exports = PanelElementsCategoriesView;

},{"./category":18}],18:[function(require,module,exports){
var PanelElementsElementView = require( './element' ),
	PanelElementsElementsCollection = require( '../collections/elements' ),
	PanelElementsCategoryView;

PanelElementsCategoryView = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-panel-elements-category',

	className: 'elementor-panel-category',

	childView: PanelElementsElementView,

	childViewContainer: '.panel-elements-category-items',

	initialize: function() {
		this.collection = new PanelElementsElementsCollection( this.model.get( 'items' ) );
	}
} );

module.exports = PanelElementsCategoryView;

},{"../collections/elements":14,"./element":19}],19:[function(require,module,exports){
var PanelElementsElementView;

PanelElementsElementView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-element-library-element',

	className: 'elementor-element-wrapper',

	triggers: {
		dragend: 'drag:end'
	},

	onRender: function() {
		this.$el.html5Draggable( {

			onDragStart: _.bind( function() {
				this.triggerMethod( 'drag:start' );
			}, this ),

			groups: [ 'elementor-element' ]
		} );
	}
} );

module.exports = PanelElementsElementView;

},{}],20:[function(require,module,exports){
var PanelElementsElementView = require( './element' ),
	PanelElementsElementsView;

PanelElementsElementsView = Marionette.CollectionView.extend( {
	childView: PanelElementsElementView,

	id: 'elementor-panel-elements',

	initialize: function() {
		this.listenTo( elementor.panelElements, 'change', this.onFilterChanged );
	},

	filter: function( childModel ) {
		var filterValue = elementor.panelElements.request( 'filter:value' );

		if ( ! filterValue ) {
			return true;
		}

		return _.any( [ 'title', 'keywords' ], function( type ) {
			return ( -1 !== childModel.get( type ).toLowerCase().indexOf( filterValue.toLowerCase() ) );
		} );
	},

	onFilterChanged: function() {
		this._renderChildren();
		this.triggerMethod( 'children:render' );
	}
} );

module.exports = PanelElementsElementsView;

},{"./element":19}],21:[function(require,module,exports){
var PanelElementsSearchView;

PanelElementsSearchView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-element-search',

	id: 'elementor-panel-elements-search-wrapper',

	ui: {
		input: 'input'
	},

	events: {
		'keyup @ui.input': 'onInputChanged'
	},

	onInputChanged: function( event ) {
		var ESC_KEY = 27;

		if ( ESC_KEY === event.keyCode ) {
			this.clearInput();
		}

		this.triggerMethod( 'search:change:input' );
	},

	clearInput: function() {
		this.ui.input.val( '' );
	}
} );

module.exports = PanelElementsSearchView;

},{}],22:[function(require,module,exports){
var PanelMenuItemView = require( 'elementor-panel/pages/menu/views/item' ),
	PanelMenuPageView;

PanelMenuPageView = Marionette.CollectionView.extend( {
	id: 'elementor-panel-page-menu',

	childView: PanelMenuItemView,

	initialize: function() {
		this.collection = new Backbone.Collection( [
            {
                icon: 'paint-brush',
                title: elementor.translate( 'colors' ),
				type: 'page',
                pageName: 'colorsScheme'
            },
            {
                icon: 'font',
                title: elementor.translate( 'fonts' ),
				type: 'page',
                pageName: 'typographyScheme'
            },
            {
				icon: 'file-text',
				title: elementor.translate( 'page_settings' ) + '  <span>(' + elementor.translate( 'soon' ) + ')</span>'
			},
			{
				icon: 'cog',
				title: elementor.translate( 'elementor_settings' ),
				type: 'link',
				link: elementor.config.settings_page_link
			},
			{
				icon: 'history',
				title: elementor.translate( 'revisions_history' ) + '  <span>(' + elementor.translate( 'soon' ) + ')</span>'
			},
			{
				icon: 'info-circle',
				title: elementor.translate( 'about_elementor' ),
				type: 'link',
				link: elementor.config.elementor_site,
				newTab: true
			}
		] );
	},

	onChildviewClick: function( childView ) {
		var menuItemType = childView.model.get( 'type' );

		switch ( menuItemType ) {
			case 'page' :
				var pageName = childView.model.get( 'pageName' ),
					pageTitle = childView.model.get( 'title' );

				elementor.getPanelView().setPage( pageName, pageTitle );
				break;

			case 'link' :
				var link = childView.model.get( 'link' ),
					isNewTab = childView.model.get( 'newTab' );

				if ( isNewTab ) {
					open( link, '_blank' );
				} else {
					location.href = childView.model.get( 'link' );
				}

				break;
		}
	}
} );

module.exports = PanelMenuPageView;

},{"elementor-panel/pages/menu/views/item":23}],23:[function(require,module,exports){
var PanelMenuItemView;

PanelMenuItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-menu-item',

	className: 'elementor-panel-menu-item',

	triggers: {
		click: 'click'
	}
} );

module.exports = PanelMenuItemView;

},{}],24:[function(require,module,exports){
var PanelSchemeBaseView;

PanelSchemeBaseView = Marionette.CompositeView.extend( {
	id: function() {
		return 'elementor-panel-scheme-' + this.getType();
	},

	className: 'elementor-panel-scheme',

	ui: function() {
		return {
			saveButton: '.elementor-panel-scheme-save .elementor-button',
			discardButton: '.elementor-panel-scheme-discard .elementor-button',
			resetButton: '.elementor-panel-scheme-reset .elementor-button'
		};
	},

	events: function() {
		return {
			'click @ui.saveButton': 'saveScheme',
			'click @ui.discardButton': 'discardScheme',
			'click @ui.resetButton': 'setDefaultScheme'
		};
	},

	childViewContainer: '.elementor-panel-scheme-items',

	templateHelpers: function() {
		return {
			getTitle: _.bind( this.getTitle, this )
		};
	},

	initialize: function() {
		this.model = new Backbone.Model();

		this.resetScheme();
	},

	getType: function() {},

	getTitle: function() {
		return this.getScheme().title;
	},

	getScheme: function() {
		return elementor.schemes.getScheme( this.getType() );
	},

	changeChildrenUIValues: function( schemeItems ) {
		var self = this;

		_.each( schemeItems, function( value, key ) {
			var model = self.collection.findWhere( { key: key } ),
				childView = self.children.findByModelCid( model.cid );

			childView.changeUIValue( value );
		} );
	},

	discardScheme: function() {
		elementor.schemes.resetSchemes( this.getType() );

		this.ui.saveButton.prop( 'disabled', true );

		this._renderChildren();
	},

	setSchemeValue: function( key, value ) {
		elementor.schemes.setSchemeValue( this.getType(), key, value );
	},

	saveScheme: function() {
		elementor.schemes.saveScheme( this.getType() );

		this.ui.saveButton.prop( 'disabled', true );

		this.resetScheme();

		this._renderChildren();
	},

	setDefaultScheme: function() {
		var defaultScheme = elementor.config.default_schemes[ this.getType() ].items;

		this.changeChildrenUIValues( defaultScheme );
	},

	resetItems: function() {
		this.model.set( 'items', this.getScheme().items );
	},

	resetCollection: function() {
		var items = this.model.get( 'items' );

		this.collection = new Backbone.Collection();

		_.each( items, _.bind( function( item, key ) {
			item.type = this.getType();
			item.key = key;

			this.collection.add( item );
		}, this ) );
	},

	resetScheme: function() {
		this.resetItems();
		this.resetCollection();
	},

	onChildviewValueChange: function( childView, newValue ) {
		this.ui.saveButton.removeProp( 'disabled' );

		this.setSchemeValue( childView.model.get( 'key' ), newValue );
	}
} );

module.exports = PanelSchemeBaseView;

},{}],25:[function(require,module,exports){
var PanelSchemeBaseView = require( 'elementor-panel/pages/schemes/base' ),
	PanelSchemeColorsView;

PanelSchemeColorsView = PanelSchemeBaseView.extend( {
	template: '#tmpl-elementor-panel-schemes-colors',

	ui: function() {
		var ui = PanelSchemeBaseView.prototype.ui.apply( this, arguments );

		ui.systemSchemes = '.elementor-panel-scheme-color-system-scheme';

		return ui;
	},

	events: function() {
		var events = PanelSchemeBaseView.prototype.events.apply( this, arguments );

		events[ 'click @ui.systemSchemes' ] = 'onSystemSchemeClick';

		return events;
	},

	getChildView: function() {
		return require( 'elementor-panel/pages/schemes/items/color' );
	},

	getType: function() {
		return 'color';
	},

	onSystemSchemeClick: function( event ) {
		var $schemeClicked = Backbone.$( event.currentTarget ),
			schemeName = $schemeClicked.data( 'schemeName' ),
			scheme = elementor.config.system_schemes.color[ schemeName ].items;

		this.changeChildrenUIValues( scheme );
	}
} );

module.exports = PanelSchemeColorsView;

},{"elementor-panel/pages/schemes/base":24,"elementor-panel/pages/schemes/items/color":28}],26:[function(require,module,exports){
var PanelSchemeDisabledView;

PanelSchemeDisabledView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-schemes-disabled',

	id: 'elementor-panel-schemes-disabled'
} );

module.exports = PanelSchemeDisabledView;

},{}],27:[function(require,module,exports){
var PanelSchemeItemView;

PanelSchemeItemView = Marionette.ItemView.extend( {
	getTemplate: function() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-panel-scheme-' + this.model.get( 'type' ) + '-item' );
	},

	className: function() {
		return 'elementor-panel-scheme-item';
	}
} );

module.exports = PanelSchemeItemView;

},{}],28:[function(require,module,exports){
var PanelSchemeItemView = require( 'elementor-panel/pages/schemes/items/base' ),
	PanelSchemeColorView;

PanelSchemeColorView = PanelSchemeItemView.extend( {
	ui: {
		input: '.elementor-panel-scheme-color-value'
	},

	changeUIValue: function( newValue ) {
		this.ui.input.wpColorPicker( 'color', newValue );
	},

	onBeforeDestroy: function() {
		if ( this.ui.input.wpColorPicker( 'instance' ) ) {
			this.ui.input.wpColorPicker( 'close' );
		}
	},

	onRender: function() {
		this.ui.input.wpColorPicker( {
			change: _.bind( function( event, ui ) {
				this.triggerMethod( 'value:change', ui.color.toString() );
			}, this )
		} );
	}
} );

module.exports = PanelSchemeColorView;

},{"elementor-panel/pages/schemes/items/base":27}],29:[function(require,module,exports){
var PanelSchemeItemView = require( 'elementor-panel/pages/schemes/items/base' ),
	PanelSchemeTypographyView;

PanelSchemeTypographyView = PanelSchemeItemView.extend( {
	className: function() {
		var classes = PanelSchemeItemView.prototype.className.apply( this, arguments );

		return classes + ' elementor-panel-box';
	},

	ui: {
		heading: '.elementor-panel-heading',
		allFields: '.elementor-panel-scheme-typography-item-field',
		inputFields: 'input.elementor-panel-scheme-typography-item-field',
		selectFields: 'select.elementor-panel-scheme-typography-item-field',
		selectFamilyFields: 'select.elementor-panel-scheme-typography-item-field[name="font_family"]'
	},

	events: {
		'input @ui.inputFields': 'onFieldChange',
		'change @ui.selectFields': 'onFieldChange',
		'click @ui.heading': 'toggleVisibility'
	},

	onRender: function() {
		var self = this;

		this.ui.inputFields.add( this.ui.selectFields ).each( function() {
			var $this = Backbone.$( this ),
				name = $this.attr( 'name' ),
				value = self.model.get( 'value' )[ name ];

			$this.val( value );
		} );

		this.ui.selectFamilyFields.select2( {
			dir: elementor.config.is_rtl ? 'rtl' : 'ltr'
		} );
	},

	toggleVisibility: function() {
		this.ui.heading.toggleClass( 'elementor-open' );
	},

	changeUIValue: function( newValue ) {
		this.ui.allFields.each( function() {
			var $this = Backbone.$( this ),
				thisName = $this.attr( 'name' ),
				newFieldValue = newValue[ thisName ];

			$this.val( newFieldValue ).trigger( 'change' );
		} );
	},

	onFieldChange: function( event ) {
		var $select = this.$( event.currentTarget ),
			currentValue = elementor.helpers.cloneObject( this.model.get( 'value' ) ),
			fieldKey = $select.attr( 'name' );

		currentValue[ fieldKey ] = $select.val();

		if ( 'font_family' === fieldKey && ! _.isEmpty( currentValue[ fieldKey ] ) ) {
			elementor.helpers.enqueueFont( currentValue[ fieldKey ] );
		}

		this.triggerMethod( 'value:change', currentValue );
	}
} );

module.exports = PanelSchemeTypographyView;

},{"elementor-panel/pages/schemes/items/base":27}],30:[function(require,module,exports){
var PanelSchemeBaseView = require( 'elementor-panel/pages/schemes/base' ),
	PanelSchemeTypographyView;

PanelSchemeTypographyView = PanelSchemeBaseView.extend( {
	template: '#tmpl-elementor-panel-schemes-typography',

	getChildView: function() {
		return require( 'elementor-panel/pages/schemes/items/typography' );
	},

	getType: function() {
		return 'typography';
	}
} );

module.exports = PanelSchemeTypographyView;

},{"elementor-panel/pages/schemes/base":24,"elementor-panel/pages/schemes/items/typography":29}],31:[function(require,module,exports){
var EditModeItemView = require( 'elementor-layouts/edit-mode' ),
	PanelLayoutView;

PanelLayoutView = Marionette.LayoutView.extend( {
	template: '#tmpl-elementor-panel',

	className: 'elementor-panel-inner',

	regions: {
		content: '#elementor-panel-content-wrapper',
		header: '#elementor-panel-header-wrapper',
		footer: '#elementor-panel-footer',
		modeSwitcher: '#elementor-mode-switcher'
	},

	pages: {},

	childEvents: {
		'click:add': function() {
			this.setPage( 'elements' );
		},
		'editor:destroy': function() {
			this.setPage( 'elements' );
		}
	},

	currentPageName: null,

	_isScrollbarInitialized: false,

	initialize: function() {
		this.initPages();
	},

	initPages: function() {
		var pages = {
			elements: {
				view: require( 'elementor-panel/pages/elements/elements' ),
				title: '<img src="' + elementor.config.assets_url + 'images/logo-panel.svg">'
			},
			editor: {
				view: require( 'elementor-panel/pages/editor' )
			},
			menu: {
				view: require( 'elementor-panel/pages/menu/menu' ),
				title: '<img src="' + elementor.config.assets_url + 'images/logo-panel.svg">'
			},
			colorsScheme: {
				view: require( 'elementor-panel/pages/schemes/colors' )
			},
			typographyScheme: {
				view: require( 'elementor-panel/pages/schemes/typography' )
			}
		};

		if ( ! elementor.schemes.isSchemesEnabled() ) {
			_.each( [ 'colors', 'typography' ], function( schemeType ) {
				pages[ schemeType + 'Scheme' ].view = require( 'elementor-panel/pages/schemes/disabled' );
			} );
		}

		this.pages = pages;
	},

	getHeaderView: function() {
		return this.getChildView( 'header' );
	},

	getCurrentPageName: function() {
		return this.currentPageName;
	},

	getCurrentPageView: function() {
		return this.getChildView( 'content' );
	},

	setPage: function( page, title, viewOptions ) {
		var pageData = this.pages[ page ];

		if ( ! pageData ) {
			throw new ReferenceError( 'Elementor panel doesn\'t have page named \'' + page + '\'' );
		}

		this.showChildView( 'content', new pageData.view( viewOptions ) );

		this.getHeaderView().setTitle( title || pageData.title );

		this.currentPageName = page;
	},

	onBeforeShow: function() {
		elementor.filterState.reply( 'get', { type: 'parent', term: '' } );

		var PanelFooterItemView = require( 'elementor-layouts/panel/footer' ),
			PanelHeaderItemView = require( 'elementor-layouts/panel/header' );

		// Edit Mode
		this.showChildView( 'modeSwitcher', new EditModeItemView() );

		// Header
		this.showChildView( 'header', new PanelHeaderItemView() );

		// Footer
		this.showChildView( 'footer', new PanelFooterItemView() );

		// Added Editor events
		this.updateScrollbar = _.throttle( this.updateScrollbar, 100 );

		this.getRegion( 'content' )
			.on( 'before:show', _.bind( this.onEditorBeforeShow, this ) )
			.on( 'empty', _.bind( this.onEditorEmpty, this ) )
			.on( 'show', _.bind( this.updateScrollbar, this ) );

		// Set default page to elements
		this.setPage( 'elements' );

		this.listenTo( elementor.data, 'scrollbar:update', this.updateScrollbar );
	},

	onEditorBeforeShow: function( view, region, options ) {
		_.defer( this.updateScrollbar );
	},

	onEditorEmpty: function( oldView ) {
		this.updateScrollbar();
	},

	updateScrollbar: function() {
		var $panel = Backbone.$( '#elementor-panel-content-wrapper' );
		if ( ! this._isScrollbarInitialized ) {
			$panel.perfectScrollbar();
			this._isScrollbarInitialized = true;

			return;
		}

		$panel.perfectScrollbar( 'update' );
	}
} );

module.exports = PanelLayoutView;

},{"elementor-layouts/edit-mode":9,"elementor-layouts/panel/footer":10,"elementor-layouts/panel/header":11,"elementor-panel/pages/editor":12,"elementor-panel/pages/elements/elements":15,"elementor-panel/pages/menu/menu":22,"elementor-panel/pages/schemes/colors":25,"elementor-panel/pages/schemes/disabled":26,"elementor-panel/pages/schemes/typography":30}],32:[function(require,module,exports){
var BaseSettingsModel;

BaseSettingsModel = Backbone.Model.extend( {

	initialize: function( data ) {
		this.controls = elementor.getElementControls( this );
		if ( ! this.controls ) {
			return;
		}

		var attrs = data || {},
			defaults = {};

		_.each( this.controls, function( field ) {
			var control = elementor.config.controls[ field.type ];

			if ( _.isObject( control.default_value )  ) {
				defaults[ field.name ] = _.extend( {}, control.default_value, field['default'] || {} );
			} else {
				defaults[ field.name ] = field['default'] || control.default_value;
			}
		} );

		this.defaults = defaults;

		// TODO: Change method to recursive
		attrs = _.defaults( {}, attrs, defaults );

		_.each( this.controls, function( field ) {
			if ( 'repeater' === field.type ) {
				attrs[ field.name ] = new Backbone.Collection( attrs[ field.name ], {
					model: BaseSettingsModel
				} );
			}
		} );

		this.set( attrs );
	},

	getFontControls: function() {
		return _.filter( this.controls, _.bind( function( control ) {
			return 'font' === control.type;
		}, this ) );
	},

	getStyleControls: function() {
		return _.filter( this.controls, _.bind( function( control ) {
			return this.isStyleControl( control.name );
		}, this ) );
	},

	isStyleControl: function( attribute ) {
		var currentControl = _.find( this.controls, function( control ) {
			return attribute === control.name;
		} );

		if ( _.isUndefined( currentControl ) ) {
			return false;
		}

		return ! _.isEmpty( currentControl.selectors );
	},

    getClassControls: function() {
        return _.filter( this.controls, _.bind( function( control ) {
            return this.isClassControl( control.name );
        }, this ) );
    },

	isClassControl: function( attribute ) {
		var currentControl = _.find( this.controls, function( control ) {
			return attribute === control.name;
		} );

		return currentControl && ! _.isUndefined( currentControl.prefix_class );
	},

	getControl: function( id ) {
		return _.find( this.controls, function( control ) {
			return id === control.name;
		} );
	},

	clone: function() {
		return new BaseSettingsModel( elementor.helpers.cloneObject( this.attributes ) );
	},

	toJSON: function() {
		var data = Backbone.Model.prototype.toJSON.call( this );

		delete data.widgetType;
		delete data.elType;
		delete data.isInner;

		_.each( data, function( attribute, key ) {
			if ( attribute && attribute.toJSON ) {
				data[ key ] = attribute.toJSON();
			}
		} );

		return data;
	}
} );

module.exports = BaseSettingsModel;

},{}],33:[function(require,module,exports){
var BaseSettingsModel = require( 'elementor-models/base-settings' ),
	ColumnSettingsModel;

ColumnSettingsModel = BaseSettingsModel.extend( {
	defaults: {
		_inline_size: '',
		_column_size: 100
	}
} );

module.exports = ColumnSettingsModel;

},{"elementor-models/base-settings":32}],34:[function(require,module,exports){
var BaseSettingsModel = require( 'elementor-models/base-settings' ),
	WidgetSettingsModel = require( 'elementor-models/widget-settings' ),
	ColumnSettingsModel = require( 'elementor-models/column-settings' ),
	RowSettingsModel = require( 'elementor-models/row-settings' ),
	SectionSettingsModel = require( 'elementor-models/section-settings' ),

	ElementModel,
	ElementCollection;

ElementModel = Backbone.Model.extend( {
	defaults: {
		id: '',
		elType: '',
		isInner: false,
		settings: {},
		defaultEditSettings: {}
	},

	remoteRender: false,
	_htmlCache: null,
	_jqueryXhr: null,

	initialize: function( options ) {
		var elements = this.get( 'elements' ),
			elType = this.get( 'elType' ),
			settings;

		var settingModels = {
			widget: WidgetSettingsModel,
			column: ColumnSettingsModel,
			row: RowSettingsModel,
			section: SectionSettingsModel
		};

		var SettingsModel = settingModels[ elType ] || BaseSettingsModel;

		settings = this.get( 'settings' ) || {};
		if ( 'widget' === elType ) {
			settings.widgetType = this.get( 'widgetType' );
		}

		settings.elType = elType;
		settings.isInner = this.get( 'isInner' );

		settings = new SettingsModel( settings );
		this.set( 'settings', settings );

		this.initEditSettings();

		if ( undefined !== elements ) {
			this.set( 'elements', new ElementCollection( elements ) );
		}

		if ( 'widget' === this.get( 'elType' ) ) {
			this.remoteRender = true;
			this.setHtmlCache( options.htmlCache || '' );
		}

		// No need this variable anymore
		delete options.htmlCache;

		// Make call to remote server as throttle function
		this.renderRemoteServer = _.throttle( this.renderRemoteServer, 1000 );

		this.on( 'destroy', this.onDestroy );
		this.on( 'editor:close', this.onCloseEditor );
	},

	initEditSettings: function() {
		this.set( 'editSettings', new Backbone.Model( this.get( 'defaultEditSettings' ) ) );
	},

	onDestroy: function() {
		// Clean the memory for all use instances
		var settings = this.get( 'settings' ),
			elements = this.get( 'elements' );

		if ( undefined !== elements ) {
			_.each( _.clone( elements.models ), function( model ) {
				model.destroy();
			} );
		}
		settings.destroy();
	},

	onCloseEditor: function() {
		this.initEditSettings();
		this.renderRemoteServer();
	},

	setSetting: function( key, value, triggerChange ) {
		triggerChange = triggerChange || false;

		var settings = this.get( 'settings' );

		settings.set( key, value );

		this.set( 'settings', settings );

		if ( triggerChange ) {
			this.trigger( 'change', this );
			this.trigger( 'change:settings', this );
			this.trigger( 'change:settings:' + key, this );
		}
	},

	getSetting: function( key ) {
		var settings = this.get( 'settings' );

		if ( undefined === settings.get( key ) ) {
			return '';
		}

		return settings.get( key );
	},

	setHtmlCache: function( htmlCache ) {
		this._htmlCache = htmlCache;
	},

	getHtmlCache: function() {
		return this._htmlCache;
	},

	getTitle: function() {
		var elementData = elementor.getElementData( this );

		return ( elementData ) ? elementData.title : 'Unknown';
	},

	getIcon: function() {
		var elementData = elementor.getElementData( this );

		return ( elementData ) ? elementData.icon : 'unknown';
	},

	renderRemoteServer: function() {
		if ( ! this.remoteRender ) {
			return;
		}

		this.trigger( 'before:remote:render' );

		if ( this._jqueryXhr && 4 !== this._jqueryXhr ) {
			this._jqueryXhr.abort();
		}

		var data = this.toJSON();

		this._jqueryXhr = Backbone.$.ajax( {
			type: 'POST',
			url: elementor.config.ajaxurl,
			data: {
				action: 'elementor_render_widget',
				post_id: elementor.config.post_id,
				data: JSON.stringify( data )
			},
			dataType: 'json'
		} )

			.done( _.bind( this.onRemoteGetHtml, this ) );
	},

	onRemoteGetHtml: function( data ) {
		this.setHtmlCache( data.data.render );
		this.trigger( 'remote:render' );
	},

	clone: function() {
		var newModel = Backbone.Model.prototype.clone.apply( this, arguments );
		newModel.set( 'id', elementor.helpers.getUniqueID() );

		newModel.setHtmlCache( this.getHtmlCache() );

		var elements = this.get( 'elements' ),
			settings = this.get( 'settings' );

		if ( ! _.isEmpty( elements ) ) {
			newModel.set( 'elements', elements.clone() );
		}

		newModel.set( 'settings', settings.clone() );

		return newModel;
	},

	toJSON: function( options ) {
		options = _.extend( { copyHtmlCache: false }, options );

		// Call parent's toJSON method
		var data = Backbone.Model.prototype.toJSON.call( this );

		_.each( data, function( attribute, key ) {
			if ( attribute && attribute.toJSON ) {
				data[ key ] = attribute.toJSON( options );
			}
		} );

		if ( options.copyHtmlCache ) {
			data.htmlCache = this.getHtmlCache();
		} else {
			delete data.htmlCache;
		}

		return data;
	}

} );

ElementCollection = Backbone.Collection.extend( {
	add: function( models, options, isCorrectSet ) {
		if ( ( ! options || ! options.silent ) && ! isCorrectSet ) {
			throw 'Call Error: Adding model to element collection is allowed only by the dedicated addChildModel() method.';
		}

		return Backbone.Collection.prototype.add.call( this, models, options );
	},

	model: function( attrs, options ) {
		if ( attrs.elType ) {
			return new ElementModel( attrs, options );
		}
		return new Backbone.Model( attrs, options );
	},

	clone: function() {
		var tempCollection = Backbone.Collection.prototype.clone.apply( this, arguments ),
			newCollection = new ElementCollection();

		tempCollection.forEach( function( model ) {
			newCollection.add( model.clone(), null, true );
		} );

		return newCollection;
	}
} );

ElementCollection.prototype.sync = function() {
	return null;
};
ElementCollection.prototype.fetch = function() {
	return null;
};
ElementCollection.prototype.save = function() {
	return null;
};

ElementModel.prototype.sync = function() {
	return null;
};
ElementModel.prototype.fetch = function() {
	return null;
};
ElementModel.prototype.save = function() {
	return null;
};

module.exports = {
	Model: ElementModel,
	Collection: ElementCollection
};

},{"elementor-models/base-settings":32,"elementor-models/column-settings":33,"elementor-models/row-settings":35,"elementor-models/section-settings":36,"elementor-models/widget-settings":37}],35:[function(require,module,exports){
var BaseSettingsModel = require( 'elementor-models/base-settings' ),
	RowSettingsModel;

RowSettingsModel = BaseSettingsModel.extend( {
	defaults: {}
} );

module.exports = RowSettingsModel;

},{"elementor-models/base-settings":32}],36:[function(require,module,exports){
var BaseSettingsModel = require( 'elementor-models/base-settings' ),
	SectionSettingsModel;

SectionSettingsModel = BaseSettingsModel.extend( {
	defaults: {}
} );

module.exports = SectionSettingsModel;

},{"elementor-models/base-settings":32}],37:[function(require,module,exports){
var BaseSettingsModel = require( 'elementor-models/base-settings' ),
	WidgetSettingsModel;

WidgetSettingsModel = BaseSettingsModel.extend( {

} );

module.exports = WidgetSettingsModel;

},{"elementor-models/base-settings":32}],38:[function(require,module,exports){
var heartbeat;

heartbeat = {

	init: function() {
		var modal;

		this.getModal = function() {
			if ( ! modal ) {
				modal = this.initModal();
			}

			return modal;
		};

		Backbone.$( document ).on( {
			'heartbeat-send': function( event, data ) {
				data.elementor_post_lock = {
					post_ID: elementor.config.post_id
				};
			},
			'heartbeat-tick': function( event, response ) {
				if ( response.locked_user ) {
					heartbeat.showLockMessage( response.locked_user );
				} else {
					heartbeat.getModal().hide();
				}
			}
		} );

		if ( elementor.config.locked_user ) {
			heartbeat.showLockMessage( elementor.config.locked_user );
		}
	},

	initModal: function() {
		var modal = elementor.dialogsManager.createWidget( 'options', {
			headerMessage: elementor.translate( 'take_over' )
		} );

		modal.addButton( {
			name: 'go_back',
			text: elementor.translate( 'go_back' ),
			callback: function() {
				parent.history.go( -1 );
			}
		} );

		modal.addButton( {
			name: 'take_over',
			text: elementor.translate( 'take_over' ),
			callback: function() {
				wp.heartbeat.enqueue( 'elementor_force_post_lock', true );
				wp.heartbeat.connectNow();
			}
		} );

		return modal;
	},

	showLockMessage: function( lockedUser ) {
		var modal = heartbeat.getModal();

		modal
			.setMessage( elementor.translate( 'dialog_user_taken_over', [ lockedUser ] ) )
		    .show();
	}
};

module.exports = heartbeat;

},{}],39:[function(require,module,exports){
var helpers;

helpers = {
	_enqueuedFonts: [],

	elementsHierarchy: {
		section: {
			column: {
				widget: null,
				section: null
			}
		}
	},

	enqueueFont: function( font ) {
		if ( -1 !== this._enqueuedFonts.indexOf( font ) ) {
			return;
		}

		var fontType = elementor.config.controls.font.fonts[ font ],
			fontUrl;

		switch ( fontType ) {
			case 'googlefonts' :
				fontUrl = 'https://fonts.googleapis.com/css?family=' + font + ':100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic';
				break;

			case 'earlyaccess' :
				var fontLowerString = font.replace( /\s+/g, '' ).toLowerCase();
				fontUrl = 'https://fonts.googleapis.com/earlyaccess/' + fontLowerString + '.css';
				break;
		}

		if ( ! _.isEmpty( fontUrl ) ) {
			elementor.$previewContents.find( 'link:last' ).after( '<link href="' + fontUrl + '" rel="stylesheet" type="text/css">' );
		}
		this._enqueuedFonts.push( font );
	},

	getElementChildType: function( elementType, container ) {
		if ( ! container ) {
			container = this.elementsHierarchy;
		}

		if ( undefined !== container[ elementType ] ) {

			if ( Backbone.$.isPlainObject( container[ elementType ] ) ) {
				return Object.keys( container[ elementType ] );
			}

			return null;
		}

		for ( var type in container ) {

			if ( ! container.hasOwnProperty( type ) ) {
				continue;
			}

			if ( ! Backbone.$.isPlainObject( container[ type ] ) ) {
				continue;
			}

			var result = this.getElementChildType( elementType, container[ type ] );

			if ( result ) {
				return result;
			}
		}

		return null;
	},

	getUniqueID: function() {
		var id;

		// TODO: Check conflict models
		//while ( true ) {
			id = Math.random().toString( 36 ).substr( 2, 7 );
			//if ( 1 > $( 'li.item-id-' + id ).length ) {
				return id;
			//}
		//}
	},

	stringReplaceAll: function( string, replaces ) {
		var re = new RegExp( Object.keys( replaces ).join( '|' ), 'gi' );

		return string.replace( re, function( matched ) {
			return replaces[ matched ];
		} );
	},

	isControlVisible: function( controlModel, elementSettingsModel ) {
		var condition;

		// TODO: Better way to get this?
		if ( _.isFunction( controlModel.get ) ) {
			condition = controlModel.get( 'condition' );
		} else {
			condition = controlModel.condition;
		}

		if ( _.isEmpty( condition ) ) {
			return true;
		}

		var hasFields = _.filter( condition, function( conditionValue, conditionName ) {
			var conditionNameParts = conditionName.match( /([a-z_0-9]+)(?:\[([a-z_]+)])?(!?)$/i ),
				conditionRealName = conditionNameParts[1],
				conditionSubKey = conditionNameParts[2],
				isNegativeCondition = !! conditionNameParts[3],
				controlValue = elementSettingsModel.get( conditionRealName );

			if ( conditionSubKey ) {
				controlValue = controlValue[ conditionSubKey ];
			}

			var isContains = ( _.isArray( conditionValue ) ) ? _.contains( conditionValue, controlValue ) : conditionValue === controlValue;

			return isNegativeCondition ? isContains : ! isContains;
		} );

		return _.isEmpty( hasFields );
	},

	cloneObject: function( object ) {
		return JSON.parse( JSON.stringify( object ) );
	},

	getYoutubeIDFromURL: function( url ) {
		var videoIDParts = url.match( /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/ );

		return videoIDParts && videoIDParts[1];
	}
};

module.exports = helpers;

},{}],40:[function(require,module,exports){
var Introduction;

Introduction = function() {
	var self = this,
		modal;

	var initModal = function() {
		modal = elementor.dialogsManager.createWidget( 'elementor-modal', {
			id: 'elementor-introduction'
		} );

		modal.getElements( 'closeButton' ).on( 'click', function() {
			self.setIntroductionViewed();
		} );

		modal.on( 'hide', function() {
			modal.getElements( 'message' ).empty(); // In order to stop the video
		} );
	};

	this.getSettings = function() {
		return elementor.config.introduction;
	};

	this.getModal = function() {
		if ( ! modal ) {
			initModal();
		}

		return modal;
	};

	this.startIntroduction = function() {
		var settings = this.getSettings();

		this.getModal()
		    .setHeaderMessage( settings.title )
		    .setMessage( settings.content )
		    .show();
	};

	this.startOnLoadIntroduction = function() {
		var settings = this.getSettings();

		if ( ! settings.is_user_should_view ) {
			return;
		}

		setTimeout( _.bind( function() {
			this.startIntroduction();
		}, this ), settings.delay );
	};

	this.setIntroductionViewed = function() {
		Backbone.$.ajax( {
			type: 'POST',
			url: elementor.config.ajaxurl,
			data: {
				action: 'elementor_introduction_viewed'
			}
		} );
	};
};

module.exports = new Introduction();

},{}],41:[function(require,module,exports){
var Modals;

Modals = {
	init: function() {
		this.initModalWidgetType();
	},

	initModalWidgetType: function() {
		var modalProperties = {
			getDefaultSettings: function() {
				var settings = DialogsManager.getWidgetType( 'options' ).prototype.getDefaultSettings.apply( this, arguments );

				return _.extend( settings, {
					position: {
						my: 'center',
						at: 'center'
					},
					contentWidth: 'auto',
					contentHeight: 'auto'
				} );
			},
			buildWidget: function() {
				DialogsManager.getWidgetType( 'options' ).prototype.buildWidget.apply( this, arguments );

				var $closeButton = this.addElement( 'closeButton', '<div><i class="fa fa-times"></i></div>' );

				this.getElements( 'widgetContent' ).prepend( $closeButton );
			},
			attachEvents: function() {
				this.getElements( 'closeButton' ).on( 'click', this.hide );
			},
			onReady: function() {
				DialogsManager.getWidgetType( 'options' ).prototype.onReady.apply( this, arguments );

				var elements = this.getElements(),
					settings = this.getSettings();

				if ( 'auto' !== settings.contentWidth ) {
					elements.message.width( settings.contentWidth );
				}

				if ( 'auto' !== settings.contentHeight ) {
					elements.message.height( settings.contentHeight );
				}
			}
		};

		DialogsManager.addWidgetType( 'elementor-modal', DialogsManager.getWidgetType( 'options' ).extend( 'elementor-modal', modalProperties ) );
	}
};

module.exports = Modals;

},{}],42:[function(require,module,exports){
var presetsFactory;

presetsFactory = {

	getPresetsDictionary: function() {
		return {
			11: 100 / 9,
			12: 100 / 8,
			14: 100 / 7,
			16: 100 / 6,
			33: 100 / 3,
			66: 2 / 3 * 100,
			83: 5 / 6 * 100
		};
	},

	getAbsolutePresetValues: function( preset ) {
		var clonedPreset = elementor.helpers.cloneObject( preset ),
			presetDictionary = this.getPresetsDictionary();

		_.each( clonedPreset, function( unitValue, unitIndex ) {
			if ( presetDictionary[ unitValue ] ) {
				clonedPreset[ unitIndex ] = presetDictionary[ unitValue ];
			}
		} );

		return clonedPreset;
	},

	getPresets: function( columnsCount, presetIndex ) {
		var presets = elementor.helpers.cloneObject( elementor.config.elements.section.presets );

		if ( columnsCount ) {
			presets = presets[ columnsCount ];
		}

		if ( presetIndex ) {
			presets = presets[ presetIndex ];
		}

		return presets;
	},

	getPresetByStructure: function( structure ) {
		var parsedStructure = this.getParsedStructure( structure );

		return this.getPresets( parsedStructure.columnsCount, parsedStructure.presetIndex );
	},

	getParsedStructure: function( structure ) {
		structure += ''; // Make sure this is a string

		return {
			columnsCount: structure.slice( 0, -1 ),
			presetIndex: structure.substr( -1 )
		};
	},

	getPresetSVG: function( preset, svgWidth, svgHeight, separatorWidth ) {
		svgWidth = svgWidth || 100;
		svgHeight = svgHeight || 50;
		separatorWidth = separatorWidth || 2;

		var absolutePresetValues = this.getAbsolutePresetValues( preset ),
			presetSVGPath = this._generatePresetSVGPath( absolutePresetValues, svgWidth, svgHeight, separatorWidth );

		return this._createSVGPreset( presetSVGPath, svgWidth, svgHeight );
	},

	_createSVGPreset: function( presetPath, svgWidth, svgHeight ) {
		var svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );

		svg.setAttributeNS( 'http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );
		svg.setAttribute( 'viewBox', '0 0 ' + svgWidth + ' ' + svgHeight );

		var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );

		path.setAttribute( 'd', presetPath );

		svg.appendChild( path );

		return svg;
	},

	_generatePresetSVGPath: function( preset, svgWidth, svgHeight, separatorWidth ) {
		var DRAW_SIZE = svgWidth - separatorWidth * ( preset.length - 1 );

		var xPointer = 0,
			dOutput = '';

		for ( var i = 0; i < preset.length; i++ ) {
			if ( i ) {
				dOutput += ' ';
			}

			var increment = preset[ i ] / 100 * DRAW_SIZE;

			xPointer += increment;

			dOutput += 'M' + ( +xPointer.toFixed( 4 ) ) + ',0';

			dOutput += 'V' + svgHeight;

			dOutput += 'H' + ( +( xPointer - increment ).toFixed( 4 ) );

			dOutput += 'V0Z';

			xPointer += separatorWidth;
		}

		return dOutput;
	}
};

module.exports = presetsFactory;

},{}],43:[function(require,module,exports){
var Schemes;

Schemes = function() {
	var self = this,
		styleRules = {},
		schemes = {},
		settings = {
			selectorWrapperPrefix: '.elementor-widget-'
		},
		elements = {};

	var buildUI = function() {
		elements.$previewHead.append( elements.$style );
	};

	var initElements = function() {
		elements.$style = Backbone.$( '<style>', {
			id: 'elementor-style-scheme'
		});

		elements.$previewHead = elementor.$previewContents.find( 'head' );
	};

	var initSchemes = function() {
		schemes = elementor.helpers.cloneObject( elementor.config.schemes.items );
	};

	var addStyleRule = function( selector, property ) {
		if ( ! styleRules[ selector ] ) {
			styleRules[ selector ] = [];
		}

		styleRules[ selector ].push( property );
	};

	var fetchControlStyles = function( control, widgetType ) {
		_.each( control.selectors, function( cssProperty, selector ) {
			var currentSchemeValue = self.getSchemeValue( control.scheme.type, control.scheme.value, control.scheme.key ),
				outputSelector,
				outputCssProperty;

			if ( _.isEmpty( currentSchemeValue ) ) {
				return;
			}

			outputSelector = selector.replace( /\{\{WRAPPER\}\}/g, settings.selectorWrapperPrefix + widgetType );
			outputCssProperty = elementor.getControlItemView().replaceStyleValues( cssProperty, currentSchemeValue.value );

			addStyleRule( outputSelector, outputCssProperty );
		} );
	};

	var fetchWidgetControlsStyles = function( widget, widgetType ) {
		var widgetSchemeControls = self.getWidgetSchemeControls( widget );

		_.each( widgetSchemeControls, function( control ) {
			fetchControlStyles( control, widgetType );
		} );
	};

	var fetchAllWidgetsSchemesStyle = function() {
		_.each( elementor.config.widgets, function( widget, widgetType ) {
			fetchWidgetControlsStyles(  widget, widgetType  );
		} );
	};

	var parseSchemeStyle = function() {
		var stringOutput = '';

		_.each( styleRules, function( properties, selector ) {
			stringOutput += selector + '{' + properties.join( '' ) + '}';
		} );

		return stringOutput;
	};

	var resetStyleRules = function() {
		styleRules = {};
	};

	this.init = function() {
		initElements();
		buildUI();
		initSchemes();

		return self;
	};

	this.getWidgetSchemeControls = function( widget ) {
		return _.filter( widget.controls, function( control ) {
			return _.isObject( control.scheme );
		} );
	};

	this.getSchemes = function() {
		return schemes;
	};

	this.getScheme = function( schemeName ) {
		return schemes[ schemeName ];
	};

	this.getSchemeValue = function( schemeName, value, key ) {
		var scheme = self.getScheme( schemeName ),
			schemeValue = scheme.items[ value ];

		if ( key && _.isObject( schemeValue ) ) {
			var clonedSchemeValue = elementor.helpers.cloneObject( schemeValue );

			clonedSchemeValue.value = schemeValue.value[ key ];

			return clonedSchemeValue;
		}

		return schemeValue;
	};

	this.isSchemesEnabled = function() {
		return elementor.config.schemes.is_schemes_enabled;
	};

	this.printSchemesStyle = function() {
		resetStyleRules();
		fetchAllWidgetsSchemesStyle();

		elements.$style.text( parseSchemeStyle() );
	};

	this.resetSchemes = function( schemeName ) {
		schemes[ schemeName ] = elementor.helpers.cloneObject( elementor.config.schemes.items[ schemeName ] );

		this.onSchemeChange();
	};

	this.saveScheme = function( schemeName ) {
		elementor.config.schemes.items[ schemeName ].items = elementor.helpers.cloneObject( schemes[ schemeName ].items );

		NProgress.start();
		Backbone.$.ajax( {
				type: 'POST',
				url: elementor.config.ajaxurl,
				data: {
					action: 'elementor_apply_scheme',
					scheme_name: schemeName,
					data: JSON.stringify( schemes[ schemeName ].items )
				}
			} )

			.done( function( data ) {
				NProgress.done();
			} );
	};

	this.setSchemeValue = function( schemeName, itemKey, value ) {
		schemes[ schemeName ].items[ itemKey ].value = value;

		this.onSchemeChange();
	};

	this.onSchemeChange = function() {
		this.printSchemesStyle();
	};
};

module.exports = new Schemes();

},{}],44:[function(require,module,exports){
var BaseElementView;

BaseElementView = Marionette.CompositeView.extend( {
	tagName: 'div',

	id: function() {
		return this.getElementUniqueClass();
	},

	attributes: function() {
		var type = this.model.get( 'elType' );

		if ( 'widget'  === type ) {
			type = this.model.get( 'widgetType' );
		}
		return {
			'data-element_type': type
		};
	},

	baseEvents: {},

	elementEvents: {},

	getElementType: function() {
		return this.model.get( 'elType' );
	},

	getChildType: function() {
		return elementor.helpers.getElementChildType( this.getElementType() );
	},

	events: function() {
		return _.extend( {}, this.baseEvents, this.elementEvents );
	},

	initialize: function() {
		// grab the child collection from the parent model
		// so that we can render the collection as children
		// of this parent element
		this.collection = this.model.get( 'elements' );

		if ( this.collection ) {
			this.listenTo( this.collection, 'add remove reset', this.onCollectionChanged, this );
		}

		this.listenTo( this.model.get( 'settings' ), 'change', this.onSettingsChanged, this );
		this.listenTo( this.model.get( 'editSettings' ), 'change', this.onSettingsChanged, this );

		this.on( 'render', this.enqueueFonts );
		this.on( 'render', this.renderStyles );
		this.on( 'render', this.renderCustomClasses );
		this.on( 'render', this.runReadyTrigger );

		this.initRemoveDialog();
	},

	addChildModel: function( model, options ) {
		return this.collection.add( model, options, true );
	},

	isCollectionFilled: function() {
		return false;
	},

	isInner: function() {
		return !! this.model.get( 'isInner' );
	},

	initRemoveDialog: function() {
		var removeDialog;

		this.getRemoveDialog = function() {
			if ( ! removeDialog ) {
				removeDialog = elementor.dialogsManager.createWidget( 'confirm', {
					message: elementor.translate( 'dialog_confirm_delete' ),
					headerMessage: elementor.translate( 'delete_element' ),
					strings: {
						confirm: elementor.translate( 'delete' ),
						cancel: elementor.translate( 'cancel' )
					},
					defaultOption: 'confirm',
					onConfirm: _.bind( function() {
						this.model.destroy();
					}, this )
				} );
			}

			return removeDialog;
		};
	},

	enqueueFonts: function() {
		_.each( this.model.get( 'settings' ).getFontControls(), _.bind( function( control ) {
			var fontFamilyName = this.model.getSetting( control.name );
			if ( _.isEmpty( fontFamilyName ) ) {
				return;
			}

			var isVisible = elementor.helpers.isControlVisible( control, this.model.get( 'settings' ) );
			if ( ! isVisible ) {
				return;
			}

			elementor.helpers.enqueueFont( fontFamilyName );
		}, this ) );
	},

	renderStyles: function() {
		var styleHtml = '',
			$stylesheet = elementor.$previewContents.find( '#elementor-style-' + this.model.cid ),
			styleControls = this.model.get( 'settings' ).getStyleControls();

		_.each( styleControls, _.bind( function( control ) {
			var controlValue = this.model.getSetting( control.name );

			if ( ! _.isNumber( controlValue ) && _.isEmpty( controlValue ) ) {
				return;
			}

			var isVisibility = elementor.helpers.isControlVisible( control, this.model.get( 'settings' ) );
			if ( ! isVisibility ) {
				return;
			}

			_.each( control.selectors, _.bind( function( cssProperty, selector ) {
				var outputSelector = selector.replace( /\{\{WRAPPER\}\}/g, '#' + this.getElementUniqueClass() ),
					outputCssProperty = elementor.getControlItemView( control.type ).replaceStyleValues( cssProperty, controlValue );

				if ( _.isEmpty( outputCssProperty ) ) {
					return;
				}

				styleHtml += outputSelector + '{' + outputCssProperty + '}';
			}, this ) );
		}, this ) );

		if ( 'column' === this.model.get( 'elType' ) ) {
			var inlineSize = this.model.getSetting( '_inline_size' );
			if ( ! _.isEmpty( inlineSize ) ) {
				styleHtml += '@media (min-width: 768px) {#' + this.getElementUniqueClass() + '{width:' + inlineSize + '%;}';
			}
		}

		if ( 0 === $stylesheet.length ) {
			elementor.$previewContents.find( 'head' ).append( '<style type="text/css" id="elementor-style-' + this.model.cid + '"></style>' );
			$stylesheet = elementor.$previewContents.find( '#elementor-style-' + this.model.cid );
		}

		$stylesheet.html( styleHtml );
	},

	renderCustomClasses: function() {
		this.$el.addClass( 'elementor-element' );

		var settings = this.model.get( 'settings' );

		_.each( settings.attributes, _.bind( function( value, attribute ) {
			if ( settings.isClassControl( attribute ) ) {
				var currentControl = settings.getControl( attribute );

				this.$el.removeClass( currentControl.prefix_class + settings.previous( attribute ) );

				var isVisible = elementor.helpers.isControlVisible( currentControl, this.model.get( 'settings' ) );

				if ( isVisible && ! _.isEmpty( settings.get( attribute ) ) ) {
					this.$el.addClass( currentControl.prefix_class + settings.get( attribute ) );
					this.$el.addClass( _.result( this, 'className' ) );
				}
			}
		}, this ) );
	},

	runReadyTrigger: function() {
		_.defer( _.bind( function() {
			elementorBindUI.runReadyTrigger( this.$el );
		}, this ) );
	},

	getElementUniqueClass: function() {
		return 'elementor-element-' + this.model.get( 'id' );
	},

	onCollectionChanged: function() {
		elementor.setFlagEditorChange( true );
	},

	onSettingsChanged: function( settings ) {
		elementor.setFlagEditorChange( true );

        this.renderStyles();
		this.renderCustomClasses();
		this.enqueueFonts();
	},

	onClickRemove: function( event ) {
		event.preventDefault();
		event.stopPropagation();

		this.getRemoveDialog().show();
	}
} );

module.exports = BaseElementView;

},{}],45:[function(require,module,exports){
var BaseElementView = require( 'elementor-views/base-element' ),
	ElementEmptyView = require( 'elementor-views/element-empty' ),
	WidgetView = require( 'elementor-views/widget' ),
	ColumnView;

ColumnView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-element-column-content' ),

	elementEvents: {
		'click > .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-remove': 'onClickRemove',
		'click @ui.listTriggers': 'onClickTrigger'
	},

	getChildView: function( model ) {
		if ( 'section' === model.get( 'elType' ) ) {
			return require( 'elementor-views/section' ); // We need to require the section dynamically
		}

		return WidgetView;
	},

	emptyView: ElementEmptyView,

	className: function() {
		var classes = 'elementor-column',
			type = this.isInner() ? 'inner' : 'top';

		classes += ' elementor-' + type + '-column';

		return classes;
	},

	childViewContainer: '> .elementor-column-wrap > .elementor-widget-wrap',

	triggers: {
		'click > .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-add': 'click:new',
		'click > .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-edit': 'click:edit',
		'click > .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-trigger': 'click:edit',
		'click > .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-duplicate': 'click:duplicate'
	},

	ui: {
		columnTitle: '.column-title',
		columnInner: '> .elementor-column-wrap',
		listTriggers: '> .elementor-element-overlay .elementor-editor-element-trigger'
	},

	behaviors: {
		Sortable: {
			behaviorClass: require( 'elementor-behaviors/sortable' ),
			elChildType: 'widget'
		},
		Resizable: {
			behaviorClass: require( 'elementor-behaviors/resizable' )
		},
		HandleDuplicate: {
			behaviorClass: require( 'elementor-behaviors/handle-duplicate' )
		},
		HandleEditor: {
			behaviorClass: require( 'elementor-behaviors/handle-editor' )
		},
		HandleEditMode: {
			behaviorClass: require( 'elementor-behaviors/handle-edit-mode' )
		},
		HandleAddMode: {
			behaviorClass: require( 'elementor-behaviors/duplicate' )
		},
		HandleElementsRelation: {
			behaviorClass: require( 'elementor-behaviors/elements-relation' )
		}
	},

	initialize: function() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		this.listenTo( elementor.data, 'widget:drag:start', this.onWidgetDragStart );
		this.listenTo( elementor.data, 'widget:drag:end', this.onWidgetDragEnd );
	},

	isDroppingAllowed: function( side, event ) {
		var elementView = elementor.panelElements.request( 'element:selected' ),
			elType = elementView.model.get( 'elType' );

		if ( 'section' === elType ) {
			return ! this.isInner();
		}

		return 'widget' === elType;
	},

	changeSizeUI: function() {
		var columnSize = this.model.getSetting( '_column_size' ),
			inlineSize = this.model.getSetting( '_inline_size' ),
			columnSizeTitle = parseFloat( inlineSize || columnSize ).toFixed( 1 ) + '%';

		this.$el.attr( 'data-col', columnSize );
		//this.$el.css( 'width', inlineSize ? inlineSize + '%' : '' );

		this.ui.columnTitle.html( columnSizeTitle );
	},

	getSortableOptions: function() {
		return {
			connectWith: '.elementor-widget-wrap',
			items: '> .elementor-element'
		};
	},

	// Events
	onCollectionChanged: function() {
		BaseElementView.prototype.onCollectionChanged.apply( this, arguments );

		this.changeChildContainerClasses();
	},

	changeChildContainerClasses: function() {
		var emptyClass = 'elementor-element-empty',
			populatedClass = 'elementor-element-populated';

		if ( this.collection.isEmpty() ) {
			this.ui.columnInner.removeClass( populatedClass ).addClass( emptyClass );
		} else {
			this.ui.columnInner.removeClass( emptyClass ).addClass( populatedClass );
		}
	},

	onRender: function() {
		var self = this;

		self.changeChildContainerClasses();
		self.changeSizeUI();

		self.$el.html5Droppable( {
			items: ' > .elementor-column-wrap > .elementor-widget-wrap > .elementor-element, >.elementor-column-wrap > .elementor-widget-wrap > .elementor-empty-view > .elementor-first-add',
			axis: [ 'vertical' ],
			groups: [ 'elementor-element' ],
			isDroppingAllowed: _.bind( self.isDroppingAllowed, self ),
			onDragging: function( side, event ) {
				event.stopPropagation();

				self.$el.addClass( 'elementor-dragging-on-child' );

				if ( this.dataset.side !== side ) {
					Backbone.$( this ).attr( 'data-side', side );
				}
			},
			onDragLeave: function() {
				self.$el.removeClass( 'elementor-dragging-on-child' );

				Backbone.$( this ).removeAttr( 'data-side' );
			},
			onDropping: function( side, event ) {
				event.stopPropagation();

				var elementView = elementor.panelElements.request( 'element:selected' ),
					newIndex = Backbone.$( this ).index();

				if ( 'bottom' === side ) {
					newIndex++;
				}

				var itemData = {
					id: elementor.helpers.getUniqueID(),
					elType: elementView.model.get( 'elType' )
				};

				if ( 'widget' === itemData.elType ) {
					itemData.widgetType = elementView.model.get( 'widgetType' );
				} else if ( 'section' === itemData.elType ) {
					itemData.elements = [];
					itemData.isInner = true;
				} else {
					return;
				}

				self.triggerMethod( 'request:add', itemData, { at: newIndex } );
			}
		} );
	},

	onClickTrigger: function( event ) {
		event.preventDefault();

		var $trigger = this.$( event.currentTarget ),
			isTriggerActive = $trigger.hasClass( 'elementor-active' );

		this.ui.listTriggers.removeClass( 'elementor-active' );

		if ( ! isTriggerActive ) {
			$trigger.addClass( 'elementor-active' );
		}
	},

	onWidgetDragStart: function() {
		this.$el.addClass( 'elementor-dragging' );
	},

	onWidgetDragEnd: function() {
		this.$el.removeClass( 'elementor-dragging' );
	}
} );

module.exports = ColumnView;

},{"elementor-behaviors/duplicate":2,"elementor-behaviors/elements-relation":3,"elementor-behaviors/handle-duplicate":4,"elementor-behaviors/handle-edit-mode":5,"elementor-behaviors/handle-editor":6,"elementor-behaviors/resizable":7,"elementor-behaviors/sortable":8,"elementor-views/base-element":44,"elementor-views/element-empty":66,"elementor-views/section":67,"elementor-views/widget":69}],46:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlBaseMultipleItemView;

ControlBaseMultipleItemView = ControlBaseItemView.extend( {

	applySavedValue: function() {
		var values = this.getControlValue(),
			$inputs = this.$( '[data-setting]' ),
			self = this;

		_.each( values, function( value, key ) {
			var $input = $inputs.filter( function() {
				return key === this.dataset.setting;
			} );

			self.setInputValue( $input, value );
		} );
	},

	getControlValue: function( key ) {
		var values = this.elementSettingsModel.get( this.model.get( 'name' ) );

		if ( ! Backbone.$.isPlainObject( values ) ) {
			return {};
		}

		if ( key ) {
			return values[ key ] || '';
		}

		return elementor.helpers.cloneObject( values );
	},

	setValue: function( key, value ) {
		var values = this.getControlValue();

		if ( 'object' === typeof key ) {
			_.each( key, function( internalValue, internalKey ) {
				values[ internalKey ] = internalValue;
			} );
		} else {
			values[ key ] = value;
		}

		this.setSettingsModel( values );
	},

	updateElementModel: function( event ) {
		var inputValue = this.getInputValue( event.currentTarget ),
			key = event.currentTarget.dataset.setting;

		this.setValue( key, inputValue );
	}
}, {
	// Static methods
	replaceStyleValues: function( cssProperty, controlValue ) {
		if ( ! _.isObject( controlValue ) ) {
			return ''; // invalid
		}

		// Trying to retrieve whole the related properties
		// according to the string matches.
		// When one of the properties is empty, aborting
		// the action and returning an empty string.
		try {
			return cssProperty.replace( /\{\{([A-Z]+)}}/g, function( fullMatch, pureMatch ) {
				var value = controlValue[ pureMatch.toLowerCase() ];

				if ( '' === value ) {
					throw '';
				}

				return value;
			} );
		} catch ( exception ) {
			return '';
		}
	}
} );

module.exports = ControlBaseMultipleItemView;

},{"elementor-views/controls/base":48}],47:[function(require,module,exports){
var ControlBaseMultipleItemView = require( 'elementor-views/controls/base-multiple' ),
	ControlBaseUnitsItemView;

ControlBaseUnitsItemView = ControlBaseMultipleItemView.extend( {

	getCurrentRange: function() {
		return this.getUnitRange( this.getControlValue( 'unit' ) );
	},

	getUnitRange: function( unit ) {
		var ranges = this.model.get( 'range' );

		if ( ! ranges || ! ranges[ unit ] ) {
			return false;
		}

		return ranges[ unit ];
	}
} );

module.exports = ControlBaseUnitsItemView;

},{"elementor-views/controls/base-multiple":46}],48:[function(require,module,exports){
var ControlBaseItemView;

ControlBaseItemView = Marionette.CompositeView.extend( {
	ui: function() {
		return {
			input: 'input[data-setting][type!="checkbox"][type!="radio"]',
			checkbox: 'input[data-setting][type="checkbox"]',
			radio: 'input[data-setting][type="radio"]',
			select: 'select[data-setting]',
			textarea: 'textarea[data-setting]'
		};
	},

	className: function() {
		// TODO: Any better classes for that?
		var classes = 'elementor-control elementor-control-' + this.model.get( 'name' ) + ' elementor-control-type-' + this.model.get( 'type' ),
			modelClasses = this.model.get( 'classes' );

		if ( ! _.isEmpty( modelClasses ) ) {
			classes += ' ' + modelClasses;
		}

		if ( ! _.isEmpty( this.model.get( 'section' ) ) ) {
			classes += ' elementor-control-under-section';
		}

		return classes;
	},

	getTemplate: function() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-control-' + this.model.get( 'type' ) + '-content' );
	},

	templateHelpers: function() {
		var controlData = {
			controlValue: this.getControlValue(),
			_cid: this.model.cid
		};

		return {
			data: _.extend( {}, this.model.toJSON(), controlData )
		};
	},

	baseEvents: {
		'input @ui.input': 'onBaseInputChange',
		'change @ui.checkbox': 'onBaseInputChange',
		'change @ui.radio': 'onBaseInputChange',
		'input @ui.textarea': 'onBaseInputChange',
		'change @ui.select': 'onBaseInputChange'
	},

	childEvents: {},

	events: function() {
		return _.extend( {}, this.baseEvents, this.childEvents );
	},

	initialize: function( options ) {
		this.elementSettingsModel = options.elementSettingsModel;

		var controlType = this.model.get( 'type' ),
			controlSettings = Backbone.$.extend( true, {}, elementor.config.controls[ controlType ], this.model.attributes );

		this.model.set( controlSettings );

		this.listenTo( this.elementSettingsModel, 'change', this.toggleControlVisibility );
		this.listenTo( this.elementSettingsModel, 'control:switch:tab', this.onControlSwitchTab );
	},

	getControlValue: function() {
		return this.elementSettingsModel.get( this.model.get( 'name' ) );
	},

	isValidValue: function( value ) {
		return true;
	},

	setValue: function( value ) {
		this.setSettingsModel( value );
	},

	setSettingsModel: function( value ) {
		if ( true !== this.isValidValue( value ) ) {
			this.triggerMethod( 'settings:error' );
			return;
		}

		this.elementSettingsModel.set( this.model.get( 'name' ), value );

		this.triggerMethod( 'settings:change' );
	},

	applySavedValue: function() {
		this.setInputValue( '[data-setting="' + this.model.get( 'name' ) + '"]', this.getControlValue() );
	},

	getEditSettings: function( setting ) {
		var settings = this.getOption( 'elementEditSettings' ).toJSON();

		if ( setting ) {
			return settings[ setting ];
		}

		return settings;
	},

	setEditSetting: function( settingKey, settingValue ) {
		var settings = this.getOption( 'elementEditSettings' );

		settings.set( settingKey, settingValue );
	},

	getInputValue: function( input ) {
		var $input = this.$( input ),
			inputValue = $input.val(),
			inputType = $input.attr( 'type' );

		if ( 'checkbox' === inputType ) {
			return $input.prop( 'checked' );
		} else if ( 'radio' === inputType ) {
			return $input.prop( 'checked' ) ? inputValue : '';
		}

		return inputValue;
	},

	// This method used inside of repeater
	getFieldTitleValue: function() {
		return this.getControlValue();
	},

	setInputValue: function( input, value ) {
		var $input = this.$( input ),
			inputType = $input.attr( 'type' );

		if ( 'checkbox' === inputType ) {
			$input.prop( 'checked', !! value );
		} else if ( 'radio' === inputType ) {
			$input.filter( '[value="' + value + '"]' ).prop( 'checked', true );
		} else {
			$input.val( value );
		}
	},

	onSettingsError: function() {
		this.$el.addClass( 'elementor-error' );
	},

	onSettingsChange: function() {
		this.$el.removeClass( 'elementor-error' );
	},

	onRender: function() {
		this.applySavedValue();

		var layoutType = this.model.get( 'label_block' ) ? 'block' : 'inline',
			showLabel = this.model.get( 'show_label' ),
			elClasses = 'elementor-label-' + layoutType;

		elClasses += ' elementor-control-separator-' + this.model.get( 'separator' );

		if ( ! showLabel ) {
			elClasses += ' elementor-control-hidden-label';
		}

		this.$el.addClass( elClasses );

		this.triggerMethod( 'ready' );
		this.toggleControlVisibility();
	},

	onBaseInputChange: function( event ) {
		this.updateElementModel( event );

		this.triggerMethod( 'input:change', event );
	},

	toggleControlVisibility: function() {
		var isVisible = elementor.helpers.isControlVisible( this.model, this.elementSettingsModel );

		this.$el.toggleClass( 'elementor-hidden-control', ! isVisible );

		elementor.data.trigger( 'scrollbar:update' );
	},

	onControlSwitchTab: function( activeTab ) {
		this.$el.toggleClass( 'elementor-active-tab', ( activeTab === this.model.get( 'tab' ) ) );

		elementor.data.trigger( 'scrollbar:update' );
	},

	onReady: function() {},

	updateElementModel: function( event ) {
		this.setValue( this.getInputValue( event.currentTarget ) );
	}
}, {
	// Static methods
	replaceStyleValues: function( cssProperty, controlValue ) {
		var replaceArray = { '\{\{VALUE\}\}': controlValue };

		return elementor.helpers.stringReplaceAll( cssProperty, replaceArray );
	}
} );

module.exports = ControlBaseItemView;

},{}],49:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlChooseItemView;

ControlChooseItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.inputs = '[type=radio]';

		return ui;
	},

	childEvents: {
		'mousedown label': 'onMouseDownLabel',
		'click @ui.inputs': 'onClickInput',
		'change @ui.inputs': 'updateElementModel'
	},

	onMouseDownLabel: function( event ) {
		var $clickedLabel = this.$( event.currentTarget ),
			$selectedInput = this.$( '#' + $clickedLabel.attr( 'for' ) );

		$selectedInput.data( 'checked', $selectedInput.prop( 'checked' ) );
	},

	onClickInput: function( event ) {
		if ( ! this.model.get( 'toggle' ) ) {
			return;
		}

		var $selectedInput = this.$( event.currentTarget );

		if ( $selectedInput.data( 'checked' ) ) {
			$selectedInput.prop( 'checked', false ).trigger( 'change' );
		}
	},

	onRender: function() {
		ControlBaseItemView.prototype.onRender.apply( this, arguments );

		var currentValue = this.getControlValue();

		if ( currentValue ) {
			this.ui.inputs.filter( '[value=' + currentValue + ']' ).prop( 'checked', true );
		} else if ( ! this.model.get( 'toggle' ) ) {
			this.ui.inputs.first().prop( 'checked', true ).trigger( 'change' );
		}
	}
} );

module.exports = ControlChooseItemView;

},{"elementor-views/controls/base":48}],50:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlColorItemView;

ControlColorItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.picker = '.color-picker-hex';

		return ui;
	},

	onReady: function() {
		this.ui.picker.wpColorPicker( {
			change: _.bind( function() {
				this.setValue( this.ui.picker.wpColorPicker( 'color' ) );
			}, this ),

			clear: _.bind( function() {
				this.setValue( '' );
			}, this ),

			width: 251
		} );
	},

	onBeforeDestroy: function() {
		if ( this.ui.picker.wpColorPicker( 'instance' ) ) {
			this.ui.picker.wpColorPicker( 'close' );
		}
		this.$el.remove();
	}
} );

module.exports = ControlColorItemView;

},{"elementor-views/controls/base":48}],51:[function(require,module,exports){
var ControlBaseUnitsItemView = require( 'elementor-views/controls/base-units' ),
	ControlDimensionsItemView;

ControlDimensionsItemView = ControlBaseUnitsItemView.extend( {
	ui: function() {
		var ui = ControlBaseUnitsItemView.prototype.ui.apply( this, arguments );

		ui.controls = '.elementor-control-dimension > input:enabled';
		ui.link = 'button.elementor-link-dimensions';

		return ui;
	},

	childEvents: {
		'click @ui.link': 'onLinkDimensionsClicked'
	},

	defaultDimensionValue: 0,

	initialize: function() {
		ControlBaseUnitsItemView.prototype.initialize.apply( this, arguments );

		// TODO: Need to be in helpers, and not in variable
		this.model.set( 'allowed_dimensions', this.filterDimensions( this.model.get( 'allowed_dimensions' ) ) );
	},

	getPossibleDimensions: function() {
		return [
			'top',
			'right',
			'bottom',
			'left'
		];
	},

	filterDimensions: function( filter ) {
		filter = filter || 'all';

		var dimensions = this.getPossibleDimensions();

		if ( 'all' === filter ) {
			return dimensions;
		}

		if ( ! _.isArray( filter ) ) {
			if ( 'horizontal' === filter ) {
				filter = [ 'right', 'left' ];
			} else if ( 'vertical' === filter ) {
				filter = [ 'top', 'bottom' ];
			}
		}

		return filter;
	},

	onReady: function() {
		var currentValue = this.getControlValue();

		if ( ! this.isLinkedDimensions() ) {
			this.ui.link.addClass( 'unlinked' );

			this.ui.controls.each( _.bind( function( index, element ) {
				var value = currentValue[ element.dataset.setting ];

				if ( _.isEmpty( value ) ) {
					value = this.defaultDimensionValue;
				}

				this.$( element ).val( value );
			}, this ) );
		}

		this.fillEmptyDimensions();
	},

	updateDimensionsValue: function() {
		var currentValue = {},
			dimensions = this.getPossibleDimensions(),
			$controls = this.ui.controls;

		dimensions.forEach( _.bind( function( dimension ) {
			var $element = $controls.filter( '[data-setting="' + dimension + '"]' );

			currentValue[ dimension ] = $element.length ? $element.val() : this.defaultDimensionValue;
		}, this ) );

		this.setValue( currentValue );
	},

	fillEmptyDimensions: function() {
		var dimensions = this.getPossibleDimensions(),
			allowedDimensions = this.model.get( 'allowed_dimensions' ),
			$controls = this.ui.controls;

		if ( this.isLinkedDimensions() ) {
			return;
		}

		dimensions.forEach( _.bind( function( dimension ) {
			var $element = $controls.filter( '[data-setting="' + dimension + '"]' ),
				isAllowedDimension = -1 !== _.indexOf( allowedDimensions, dimension );

			if ( isAllowedDimension && $element.length && _.isEmpty( $element.val() ) ) {
				$element.val( this.defaultDimensionValue );
			}

		}, this ) );
	},

	updateDimensions: function() {
		this.fillEmptyDimensions();
		this.updateDimensionsValue();
	},

	resetDimensions: function() {
		this.ui.controls.val( '' );

		this.updateDimensionsValue();
	},

	onInputChange: function( event ) {
		var inputSetting = event.target.dataset.setting;

		if ( 'unit' === inputSetting ) {
			this.resetDimensions();
		}

		if ( ! _.contains( this.getPossibleDimensions(), inputSetting ) ) {
			return;
		}

		if ( this.isLinkedDimensions() ) {
			var $thisControl = this.$( event.target );

			this.ui.controls.val( $thisControl.val() );
		}

		this.updateDimensions();
	},

	onLinkDimensionsClicked: function( event ) {
		event.preventDefault();
		event.stopPropagation();

		this.ui.link.toggleClass( 'unlinked' );

		this.setValue( 'isLinked', ! this.ui.link.hasClass( 'unlinked' ) );

		if ( this.isLinkedDimensions() ) {
			// Set all controls value from the first control.
			this.ui.controls.val( this.ui.controls.eq( 0 ).val() );
		}

		this.updateDimensions();
	},

	isLinkedDimensions: function() {
		return this.getControlValue( 'isLinked' );
	}
} );

module.exports = ControlDimensionsItemView;

},{"elementor-views/controls/base-units":47}],52:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlFontItemView;

ControlFontItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.fontSelect = '.elementor-control-font-family';

		return ui;
	},
	onReady: function() {
		this.ui.fontSelect.select2( {
			dir: elementor.config.is_rtl ? 'rtl' : 'ltr'
		} );
	},

	onBeforeDestroy: function() {
		if ( this.ui.fontSelect.data( 'select2' ) ) {
			this.ui.fontSelect.select2( 'destroy' );
		}
		this.$el.remove();
	},

	templateHelpers: function() {
		var helpers = ControlBaseItemView.prototype.templateHelpers.apply( this, arguments );

		helpers.getFontsByGroups = _.bind( function( groups ) {
			var fonts = this.model.get( 'fonts' ),
				filteredFonts = {};

			_.each( fonts, function( fontType, fontName ) {
				if ( _.isArray( groups ) && _.contains( groups, fontType ) || fontType === groups ) {
					filteredFonts[ fontName ] = fontType;
				}
			} );

			return filteredFonts;
		}, this );

		return helpers;
	}
} );

module.exports = ControlFontItemView;

},{"elementor-views/controls/base":48}],53:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlMediaItemView;

ControlMediaItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.addImages = '.elementor-control-gallery-add';
		ui.clearGallery = '.elementor-control-gallery-clear';
		ui.galleryThumbnails = '.elementor-control-gallery-thumbnails';

		return ui;
	},

	childEvents: {
		'click @ui.addImages': 'onAddImagesClick',
		'click @ui.clearGallery': 'onClearGalleryClick',
		'click @ui.galleryThumbnails': 'onGalleryThumbnailsClick'
	},

	onReady: function() {
		var hasImages = this.hasImages();

		this.$el
		    .toggleClass( 'elementor-gallery-has-images', hasImages )
		    .toggleClass( 'elementor-gallery-empty', ! hasImages );

		this.initRemoveDialog();
	},

	hasImages: function() {
		return !! this.getControlValue().length;
	},

	openFrame: function( action ) {
		this.initFrame( action );

		this.frame.open();
	},

	initFrame: function( action ) {
		var frameStates = {
			create: 'gallery',
			add: 'gallery-library',
			edit: 'gallery-edit'
		};

		var options = {
			frame:  'post',
			multiple: true,
			state: frameStates[ action ],
			button: {
				text: elementor.translate( 'insert_media' )
			}
		};

		if ( this.hasImages() ) {
			options.selection = this.fetchSelection();
		}

		this.frame = wp.media( options );

		// When a file is selected, run a callback.
		this.frame.on( {
			'update': this.select,
			'menu:render:default': this.menuRender,
			'content:render:browse': this.gallerySettings
		}, this );
	},

	menuRender: function( view ) {
		view.unset( 'insert' );
		view.unset( 'featured-image' );
	},

	gallerySettings: function( browser ) {
		browser.sidebar.on( 'ready', function() {
			browser.sidebar.unset( 'gallery' );
		} );
	},

	fetchSelection: function() {
		var attachments = wp.media.query( {
			orderby: 'post__in',
			order: 'ASC',
			type: 'image',
			perPage: -1,
			post__in: _.pluck( this.getControlValue(), 'id' )
		} );

		return new wp.media.model.Selection( attachments.models, {
			props: attachments.props.toJSON(),
			multiple: true
		} );
	},

	/**
	 * Callback handler for when an attachment is selected in the media modal.
	 * Gets the selected image information, and sets it within the control.
	 */
	select: function( selection ) {
		var images = [];

		selection.each( function( image ) {
			images.push( {
				id: image.get( 'id' ),
				url: image.get( 'url' )
			} );
		} );

		this.setValue( images );

		this.render();
	},

	onBeforeDestroy: function() {
		if ( this.frame ) {
			this.frame.off();
		}

		this.$el.remove();
	},

	resetGallery: function() {
		this.setValue( '' );

		this.render();
	},

	initRemoveDialog: function() {
		var removeDialog;

		this.getRemoveDialog = function() {
			if ( ! removeDialog ) {
				removeDialog = elementor.dialogsManager.createWidget( 'confirm', {
					message: elementor.translate( 'dialog_confirm_gallery_delete' ),
					headerMessage: elementor.translate( 'delete_gallery' ),
					strings: {
						confirm: elementor.translate( 'delete' ),
						cancel: elementor.translate( 'cancel' )
					},
					defaultOption: 'confirm',
					onConfirm: _.bind( this.resetGallery, this )
				} );
			}

			return removeDialog;
		};
	},

	onAddImagesClick: function() {
		this.openFrame( this.hasImages() ? 'add' : 'create' );
	},

	onClearGalleryClick: function() {
		this.getRemoveDialog().show();
	},

	onGalleryThumbnailsClick: function() {
		this.openFrame( 'edit' );
	}
} );

module.exports = ControlMediaItemView;

},{"elementor-views/controls/base":48}],54:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlIconItemView;

ControlIconItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.iconSelect = '.elementor-control-icon';

		return ui;
	},

	initialize: function() {
		ControlBaseItemView.prototype.initialize.apply( this, arguments );

		this.filterIcons();
	},

	filterIcons: function() {
		var icons = this.model.get( 'icons' ),
			include = this.model.get( 'include' ),
			exclude = this.model.get( 'exclude' );

		if ( include ) {
			var filteredIcons = {};

			_.each( include, function( iconKey ) {
				filteredIcons[ iconKey ] = icons[ iconKey ];
			} );

			this.model.set( 'icons', filteredIcons );
			return;
		}

		if ( exclude ) {
			_.each( exclude, function( iconKey ) {
				delete icons[ iconKey ];
			} );
		}
	},

	iconsList: function( icon ) {
		if ( ! icon.id ) {
			return icon.text;
		}

		return Backbone.$(
			'<span><i class="' + icon.id + '"></i> ' + icon.text + '</span>'
		);
	},

	getFieldTitleValue: function() {
		var controlValue = this.getControlValue();

		return controlValue.replace( /^fa fa-/, '' ).replace( '-', ' ' );
	},

	onReady: function() {
		this.ui.iconSelect.select2( {
			allowClear: true,
			templateResult: _.bind( this.iconsList, this ),
			templateSelection: _.bind( this.iconsList, this )
		} );
	},

	onBeforeDestroy: function() {
		if ( this.ui.iconSelect.data( 'select2' ) ) {
			this.ui.iconSelect.select2( 'destroy' );
		}
		this.$el.remove();
	}
} );

module.exports = ControlIconItemView;

},{"elementor-views/controls/base":48}],55:[function(require,module,exports){
var ControlMultipleBaseItemView = require( 'elementor-views/controls/base-multiple' ),
	ControlImageDimensionsItemView;

ControlImageDimensionsItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		return {
			inputWidth: 'input[data-setting="width"]',
			inputHeight: 'input[data-setting="height"]',

			btnApply: 'button.elementor-image-dimensions-apply-button'
		};
	},

	// Override the base events
	baseEvents: {
		'click @ui.btnApply': 'onApplyClicked'
	},

	onApplyClicked: function( event ) {
		event.preventDefault();

		this.setValue( {
			width: this.ui.inputWidth.val(),
			height: this.ui.inputHeight.val()
		} );
	}
} );

module.exports = ControlImageDimensionsItemView;

},{"elementor-views/controls/base-multiple":46}],56:[function(require,module,exports){
var ControlMultipleBaseItemView = require( 'elementor-views/controls/base-multiple' ),
	ControlMediaItemView;

ControlMediaItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.controlMedia = '.elementor-control-media';
		ui.frameOpeners = '.elementor-control-media-upload-button, .elementor-control-media-image';
		ui.deleteButton = '.elementor-control-media-delete';

		return ui;
	},

	childEvents: {
		'click @ui.frameOpeners': 'openFrame',
		'click @ui.deleteButton': 'deleteImage'
	},

	onReady: function() {
		if ( _.isEmpty( this.getControlValue( 'url' ) ) ) {
			this.ui.controlMedia.addClass( 'media-empty' );
		}
	},

	openFrame: function() {
		if ( ! this.frame ) {
			this.initFrame();
		}

		this.frame.open();
	},

	deleteImage: function() {
		this.setValue( {
			url: '',
			id: ''
		} );

		this.render();
	},

	/**
	 * Create a media modal select frame, and store it so the instance can be reused when needed.
	 */
	initFrame: function() {
		this.frame = wp.media( {
			button: {
				text: 'Insert Media' // TODO: gettext
			},
			states: [
				new wp.media.controller.Library( {
					title: 'Insert Media', // TODO: gettext
					library: wp.media.query( { type: 'image' } ),
					multiple: false,
					date: false
				} )
			]
		} );

		// When a file is selected, run a callback.
		this.frame.on( 'insert select', _.bind( this.select, this ) );
	},

	/**
	 * Callback handler for when an attachment is selected in the media modal.
	 * Gets the selected image information, and sets it within the control.
	 */
	select: function() {
		// Get the attachment from the modal frame.
		var attachment = this.frame.state().get( 'selection' ).first().toJSON();

		if ( attachment.url ) {
			this.setValue( {
				url: attachment.url,
				id: attachment.id
			} );

			this.render();
		}
	},

	onBeforeDestroy: function() {
		this.$el.remove();
	}
} );

module.exports = ControlMediaItemView;

},{"elementor-views/controls/base-multiple":46}],57:[function(require,module,exports){
var RepeaterRowView;

RepeaterRowView = Marionette.CompositeView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-repeater-row' ),

	className: 'repeater-fields',

	ui: {
		duplicateButton: '.elementor-repeater-tool-duplicate',
		editButton: '.elementor-repeater-tool-edit',
		removeButton: '.elementor-repeater-tool-remove',
		itemTitle: '.elementor-repeater-row-item-title'
	},

	triggers: {
		'click @ui.removeButton': 'click:remove',
		'click @ui.duplicateButton': 'click:duplicate',
		'click @ui.itemTitle': 'click:edit'
	},

	templateHelpers: function() {
		return {
			itemIndex: this.getOption( 'itemIndex' )
		};
	},

	childViewContainer: '.elementor-repeater-row-controls',

	getChildView: function( item ) {
		var controlType = item.get( 'type' );
		return elementor.getControlItemView( controlType );
	},

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model
		};
	},

	updateIndex: function( newIndex ) {
		this.itemIndex = newIndex;
		this.render();
	},

	setTitle: function() {
		var titleField = this.getOption( 'titleField' ),
			title;

		if ( titleField ) {
			var changerControlModel = this.collection.find( { name: titleField } ),
				changerControlView = this.children.findByModelCid( changerControlModel.cid );

			title = changerControlView.getFieldTitleValue();
		}

		if ( ! title ) {
			title = elementor.translate( 'Item #{0}', [ this.getOption( 'itemIndex' ) ] );
		}

		this.ui.itemTitle.text( title );
	},

	initialize: function( options ) {
		this.elementSettingsModel = options.elementSettingsModel;

		this.itemIndex = 0;

		// Collection for Controls list
		this.collection = new Backbone.Collection( options.controlFields );

		if ( options.titleField ) {
			this.listenTo( this.model, 'change:' + options.titleField, this.setTitle );
		}
	},

	onRender: function() {
		this.setTitle();
	}
} );

module.exports = RepeaterRowView;

},{}],58:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	RepeaterRowView = require( 'elementor-views/controls/repeater-row' ),
	ControlRepeaterItemView;

ControlRepeaterItemView = ControlBaseItemView.extend( {
	ui: {
		btnAddRow: '.elementor-repeater-add',
		fieldContainer: '.elementor-repeater-fields'
	},

	events: {
		'click @ui.btnAddRow': 'onButtonAddRowClick',
		'sortstart @ui.fieldContainer': 'onSortStart',
		'sortupdate @ui.fieldContainer': 'onSortUpdate'
	},

	childView: RepeaterRowView,

	childViewContainer: '.elementor-repeater-fields',

	templateHelpers: function() {
		return {
			data: _.extend( {}, this.model.toJSON(), { controlValue: [] } )
		};
	},

	childViewOptions: function() {
		return {
			controlFields: this.model.get( 'fields' ),
			titleField: this.model.get( 'title_field' )
		};
	},

	initialize: function( options ) {
		ControlBaseItemView.prototype.initialize.apply( this, arguments );

		this.collection = this.elementSettingsModel.get( this.model.get( 'name' ) );

		this.listenTo( this.collection, 'change add remove reset', this.onCollectionChanged, this );
	},

	editRow: function( rowView ) {
		if ( this.currentEditableChild ) {
			this.currentEditableChild.getChildViewContainer( this.currentEditableChild ).removeClass( 'editable' );
		}

		if ( this.currentEditableChild === rowView ) {
			delete this.currentEditableChild;
			return;
		}

		rowView.getChildViewContainer( rowView ).addClass( 'editable' );

		this.currentEditableChild = rowView;

		this.updateActiveRow();
	},

	toggleMinRowsClass: function() {
		if ( ! this.model.get( 'prevent_empty' ) ) {
			return;
		}

		this.$el.toggleClass( 'elementor-repeater-has-minimum-rows', 1 >= this.collection.length );
	},

	updateActiveRow: function() {
		var activeItemIndex = 0;

		if ( this.currentEditableChild ) {
			activeItemIndex = this.currentEditableChild.itemIndex;
		}

		this.setEditSetting( 'activeItemIndex', activeItemIndex );
	},

	updateChildIndexes: function() {
		this.children.each( _.bind( function( view ) {
			view.updateIndex( this.collection.indexOf( view.model ) + 1 );
		}, this ) );
	},

	onRender: function() {
		this.ui.fieldContainer.sortable( { axis: 'y' } );

		this.toggleMinRowsClass();
	},

	onSortStart: function( event, ui ) {
		ui.item.data( 'oldIndex', ui.item.index() );
	},

	onSortUpdate: function( event, ui ) {
		var oldIndex = ui.item.data( 'oldIndex' ),
			model = this.collection.at( oldIndex ),
			newIndex = ui.item.index();

		this.collection.remove( model );
		this.collection.add( model, { at: newIndex } );
	},

	onAddChild: function() {
		this.updateChildIndexes();
		this.updateActiveRow();
	},

	onRemoveChild: function( childView ) {
		if ( childView === this.currentEditableChild ) {
			delete this.currentEditableChild;
		}

		this.updateChildIndexes();
		this.updateActiveRow();
	},

	onCollectionChanged: function() {
		this.elementSettingsModel.trigger( 'change' );

		this.toggleMinRowsClass();
	},

	onButtonAddRowClick: function() {
		var defaults = {};
		_.each( this.model.get( 'fields' ), function( field ) {
			defaults[ field.name ] = field['default'];
		} );

		var newModel = this.collection.add( defaults ),
			newChildView = this.children.findByModel( newModel );

		this.editRow( newChildView );
	},

	onChildviewClickRemove: function( childView ) {
		childView.model.destroy();
	},

	onChildviewClickDuplicate: function( childView ) {
		this.collection.add( childView.model.clone(), { at: childView.itemIndex } );
	},

	onChildviewClickEdit: function( childView ) {
		this.editRow( childView );
	}
} );

module.exports = ControlRepeaterItemView;

},{"elementor-views/controls/base":48,"elementor-views/controls/repeater-row":57}],59:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlSectionItemView;

ControlSectionItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.heading = '.elementor-panel-heading';

		return ui;
	},

	triggers: {
		'click': 'control:section:clicked'
	}
} );

module.exports = ControlSectionItemView;

},{"elementor-views/controls/base":48}],60:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlSelect2ItemView;

ControlSelect2ItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.select = '.elementor-select2';

		return ui;
	},

	onReady: function() {
		var options = {
			allowClear: true
		};

		this.ui.select.select2( options );
	},

	onBeforeDestroy: function() {
		if ( this.ui.select.data( 'select2' ) ) {
			this.ui.select.select2( 'destroy' );
		}
		this.$el.remove();
	}
} );

module.exports = ControlSelect2ItemView;

},{"elementor-views/controls/base":48}],61:[function(require,module,exports){
var ControlBaseUnitsItemView = require( 'elementor-views/controls/base-units' ),
	ControlSliderItemView;

ControlSliderItemView = ControlBaseUnitsItemView.extend( {
	ui: function() {
		var ui = ControlBaseUnitsItemView.prototype.ui.apply( this, arguments );

		ui.slider = '.elementor-control-slider';

		return ui;
	},

	childEvents: {
		'slide @ui.slider': 'onSlideChange'
	},

	initSlider: function() {
		var size = this.getControlValue( 'size' ),
			unitRange = this.getCurrentRange();

		this.ui.input.attr( unitRange ).val( size );

		this.ui.slider.slider( _.extend( {}, unitRange, { value: size } ) );
	},

	resetSize: function() {
		this.setValue( 'size', '' );

		this.initSlider();
	},

	onReady: function() {
		this.initSlider();
	},

	onSlideChange: function( event, ui ) {
		this.setValue( 'size', ui.value );

		this.ui.input.val( ui.value );
	},

	onInputChange: function( event ) {
		var dataChanged = event.currentTarget.dataset.setting;

		if ( 'size' === dataChanged ) {
			this.ui.slider.slider( 'value', this.getControlValue( 'size' ) );
		} else if ( 'unit' === dataChanged ) {
			this.resetSize();
		}
	},

	onBeforeDestroy: function() {
		this.ui.slider.slider( 'destroy' );
		this.$el.remove();
	}
} );

module.exports = ControlSliderItemView;

},{"elementor-views/controls/base-units":47}],62:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlStructureItemView;

ControlStructureItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.resetStructure = '.elementor-control-structure-reset';

		return ui;
	},

	childEvents: {
		'click @ui.resetStructure': 'onResetStructureClick'
	},

	templateHelpers: function() {
		var helpers = ControlBaseItemView.prototype.templateHelpers.apply( this, arguments );

		helpers.getMorePresets = _.bind( this.getMorePresets, this );

		return helpers;
	},

	getCurrentEditedSection: function() {
		var editor = elementor.getPanelView().getCurrentPageView();

		return editor.getOption( 'editedElementView' );
	},

	getMorePresets: function() {
		var parsedStructure = elementor.presetsFactory.getParsedStructure( this.getControlValue() );

		return elementor.presetsFactory.getPresets( parsedStructure.columnsCount );
	},

	onInputChange: function() {
		this.getCurrentEditedSection().redefineLayout();

		this.render();
	},

	onResetStructureClick: function() {
		this.getCurrentEditedSection().resetColumnsCustomSize();
	}
} );

module.exports = ControlStructureItemView;

},{"elementor-views/controls/base":48}],63:[function(require,module,exports){
var ControlMultipleBaseItemView = require( 'elementor-views/controls/base-multiple' ),
	ControlUrlItemView;

ControlUrlItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.btnExternal = 'button.elementor-control-url-target';

		return ui;
	},

	// Override the base events
	childEvents: {
		'click @ui.btnExternal': 'onExternalClicked'
	},

	onReady: function() {
		if ( this.getControlValue( 'is_external' ) ) {
			this.ui.btnExternal.addClass( 'active' );
		}
	},

	onExternalClicked: function( event ) {
		event.preventDefault();

		this.ui.btnExternal.toggleClass( 'active' );
		this.setValue( 'is_external', this.isExternal() );
	},

	isExternal: function() {
		return this.ui.btnExternal.hasClass( 'active' );
	}
} );

module.exports = ControlUrlItemView;

},{"elementor-views/controls/base-multiple":46}],64:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlWPWidgetItemView;

ControlWPWidgetItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.form = 'form';
		ui.loading = '.wp-widget-form-loading';

		return ui;
	},

	events: {
		'keyup @ui.form :input': 'onFormChanged',
		'change @ui.form :input': 'onFormChanged'
	},

	onFormChanged: function() {
		var idBase = 'widget-' + this.model.get( 'id_base' ),
			settings = this.ui.form.elementorSerializeObject()[ idBase ].REPLACE_TO_ID;

		this.setValue( settings );
	},

	onReady: function() {
		Backbone.$.ajax( {
			type: 'POST',
			url: elementor.config.ajaxurl,
			data: {
				action: 'elementor_editor_get_wp_widget_form',
				widget_type: this.model.get( 'widget' ),
				data: JSON.stringify( this.elementSettingsModel.toJSON() )
			}
		} )
			.done( _.bind( function( data ) {
				this.ui.form.html( data );
			}, this ) );
	}
} );

module.exports = ControlWPWidgetItemView;

},{"elementor-views/controls/base":48}],65:[function(require,module,exports){
var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlWysiwygItemView;

ControlWysiwygItemView = ControlBaseItemView.extend( {
	childEvents: {
		'keyup textarea.elementor-wp-editor': 'updateElementModel'
	},

	buttons: {
		keepInBasic: [
			'bold',
			'italic',
			'link',
			'unlink',
			'wp_adv',
			'fullscreen'
		],
		moveToBasic: {
			underline: 'italic'
		}
	},

	initialize: function() {
		ControlBaseItemView.prototype.initialize.apply( this, arguments );

		var self = this;

		this.editorID = 'elementorwpeditor' + this.cid;

		var editorConfig = {
			id: this.editorID,
			selector: '#' + this.editorID,
			setup: function( editor ) {
				editor.on( 'keyup change', function() {
					editor.save();

					self.setValue( editor.getContent() );
				} );
			}
		};

		tinyMCEPreInit.mceInit[ this.editorID ] = _.extend( _.clone( tinyMCEPreInit.mceInit.elementorwpeditor ), editorConfig );

		this.rearrangeButtons();

		// This class allows us to reduce "flicker" by hiding the editor
		// until we are done loading and modifying it.
		this.$el.addClass( 'elementor-loading-editor' );

		// Wait a cycle before initializing the editors.
		_.defer( function() {
			// Initialize QuickTags, and set as the default mode.
			quicktags( {
				buttons: 'strong,em,del,link,img,close',
				id: self.editorID
			} );

			switchEditors.go( self.editorID, 'tmce' );

			// Remove default instance after initializes. This allows reinitializion an unlimited amount of times.
			_.defer( function() {
				delete QTags.instances[ 0 ];
			} );

		} );
	},

	attachElContent: function() {
		var editorTemplate = elementor.config.wp_editor.replace( /elementorwpeditor/g, this.editorID ).replace( '%%EDITORCONTENT%%', this.getControlValue() );

		this.$el.html( editorTemplate );

		return this;
	},

	rearrangeButtons: function() {
		var editorProps = tinyMCEPreInit.mceInit[ this.editorID ],
			editorBasicToolbarButtons = editorProps.toolbar1.split( ',' ),
			editorAdvancedToolbarButtons = editorProps.toolbar2.split( ',' ),
			buttonsToKeepInBasic = Array.prototype.slice.call( this.buttons.keepInBasic ),
			buttonsToMoveToAdvanced = _.difference( editorBasicToolbarButtons, buttonsToKeepInBasic ),
			buttonsToKeepInAdvanced = _.difference( editorAdvancedToolbarButtons, Object.keys( this.buttons.moveToBasic ) );

		_.each( this.buttons.moveToBasic, function( afterButton, button ) {
			var afterButtonIndex = buttonsToKeepInBasic.indexOf( afterButton );

			if ( -1 !== afterButtonIndex ) {
				buttonsToKeepInBasic.splice( afterButtonIndex + 1, 0, button );
			}
		} );

		editorProps.toolbar1 = buttonsToKeepInBasic.join( ',' );
		editorProps.toolbar2 = buttonsToMoveToAdvanced + ',' + buttonsToKeepInAdvanced;
	},

	onBeforeDestroy: function() {
		// Remove TinyMCE and QuickTags instances
		tinymce.EditorManager.execCommand( 'mceRemoveEditor', true, this.editorID );
		delete QTags.instances[ this.editorID ];

		// Cleanup PreInit data
		delete tinyMCEPreInit.mceInit[ this.editorID ];
		delete tinyMCEPreInit.qtInit[ this.editorID ];
	}
} );

module.exports = ControlWysiwygItemView;

},{"elementor-views/controls/base":48}],66:[function(require,module,exports){
var ElementEmptyView;

ElementEmptyView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-empty-preview',

	className: 'elementor-empty-view',

	events: {
		'click': 'onClickAdd'
	},

	onClickAdd: function() {
		elementor.getPanelView().setPage( 'elements' );
	}
} );

module.exports = ElementEmptyView;

},{}],67:[function(require,module,exports){
var BaseElementView = require( 'elementor-views/base-element' ),
	ColumnView = require( 'elementor-views/column' ),
	SectionView;

SectionView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-element-section-content' ),

	childView: ColumnView,

	className: function() {
		var classes = 'elementor-section',
			type = this.isInner() ? 'inner' : 'top';

		classes += ' elementor-' + type + '-section';

		return classes;
	},

	tagName: 'section',

	childViewContainer: '> .elementor-container > .elementor-row',

	triggers: {
		'click .elementor-editor-section-settings-list .elementor-editor-element-edit': 'click:edit',
		'click .elementor-editor-section-settings-list .elementor-editor-element-trigger': 'click:edit',
		'click .elementor-editor-section-settings-list .elementor-editor-element-duplicate': 'click:duplicate'
	},

	elementEvents: {
		'click .elementor-editor-section-settings-list .elementor-editor-element-remove': 'onClickRemove'
	},

	behaviors: {
		Sortable: {
			behaviorClass: require( 'elementor-behaviors/sortable' ),
			elChildType: 'column'
		},
		HandleDuplicate: {
			behaviorClass: require( 'elementor-behaviors/handle-duplicate' )
		},
		HandleEditor: {
			behaviorClass: require( 'elementor-behaviors/handle-editor' )
		},
		HandleEditMode: {
			behaviorClass: require( 'elementor-behaviors/handle-edit-mode' )
		},
		HandleAddMode: {
			behaviorClass: require( 'elementor-behaviors/duplicate' )
		},
		HandleElementsRelation: {
			behaviorClass: require( 'elementor-behaviors/elements-relation' )
		}
	},

	initialize: function() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		this.listenTo( this.collection, 'add remove reset', this._checkIsFull );
		this.listenTo( this.collection, 'remove', this.onCollectionRemove );
		this.listenTo( this.model, 'change:settings:structure', this.onStructureChanged );
	},

	addEmptyColumn: function() {
		this.addChildModel( {
			id: elementor.helpers.getUniqueID(),
			elType: 'column',
			settings: {},
			elements: []
		} );
	},

	addChildModel: function( model, options ) {
		var isModelInstance = model instanceof Backbone.Model,
			isInner = this.isInner();

		if ( isModelInstance ) {
			model.set( 'isInner', isInner );
		} else {
			model.isInner = isInner;
		}

		return BaseElementView.prototype.addChildModel.apply( this, arguments );
	},

	getSortableOptions: function() {
		var sectionConnectClass = this.isInner() ? '.elementor-inner-section' : '.elementor-top-section';

		return {
			connectWith: sectionConnectClass + ' > .elementor-container > .elementor-row',
			handle: '> .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-trigger',
			items: '> .elementor-column'
		};
	},

	getColumnPercentSize: function( element, size ) {
		return size / element.parent().width() * 100;
	},

	getDefaultStructure: function() {
		return this.collection.length + '0';
	},

	getStructure: function() {
		return this.model.getSetting( 'structure' );
	},

	setStructure: function( structure ) {
		var parsedStructure = elementor.presetsFactory.getParsedStructure( structure );

		if ( +parsedStructure.columnsCount !== this.collection.length ) {
			throw new TypeError( 'The provided structure doesn\'t match the columns count.' );
		}

		this.model.setSetting( 'structure', structure, true );
	},

	redefineLayout: function() {
		var preset = elementor.presetsFactory.getPresetByStructure( this.getStructure() );

		this.collection.each( function( model, index ) {
			model.setSetting( '_column_size', preset.preset[ index ] );
			model.setSetting( '_inline_size', null );
		} );

		this.children.invoke( 'changeSizeUI' );
	},

	resetLayout: function() {
		this.setStructure( this.getDefaultStructure() );
	},

	resetColumnsCustomSize: function() {
		this.collection.each( function( model ) {
			model.setSetting( '_inline_size', null );
		} );

		this.children.invoke( 'changeSizeUI' );
	},

	isCollectionFilled: function() {
		var MAX_SIZE = 10,
			columnsCount = this.collection.length;

		return ( MAX_SIZE <= columnsCount );
	},

	_checkIsFull: function() {
		this.$el.toggleClass( 'elementor-section-filled', this.isCollectionFilled() );
	},

	_checkIsEmpty: function() {
		if ( ! this.collection.length ) {
			this.addEmptyColumn();
		}
	},

	onBeforeRender: function() {
		this._checkIsEmpty();
	},

	onRender: function() {
		this._checkIsFull();
	},

	onAddChild: function() {
		if ( ! this.isBuffering ) {
			// Reset the layout just when we have really add/remove element.
			this.resetLayout();
		}
	},

	onCollectionRemove: function() {
		// If it's the last column, please create new one.
		this._checkIsEmpty();

		this.resetLayout();
	},

	onChildviewRequestResize: function( childView, ui ) {
		// Get current column details
		var currentSize = childView.model.getSetting( '_inline_size' );

		if ( ! currentSize ) {
			currentSize = this.getColumnPercentSize( ui.element, ui.originalSize.width );
		}

		var	newSize = this.getColumnPercentSize( ui.element, ui.size.width ),
			difference = newSize - currentSize;

		ui.element.css( {
			//width: currentSize + '%',
			width: '',
			left: 'initial' // Fix for RTL resizing
		} );

		// Get next column details
		var modelIndex = this.collection.indexOf( childView.model ),
			nextModel = this.collection.at( modelIndex + 1 ),
			nextChildView = this.children.findByModelCid( nextModel.cid );

		if ( ! nextChildView ) {
			return;
		}

		var $nextElement = nextChildView.$el,
			nextElementCurrentSize = this.getColumnPercentSize( $nextElement, $nextElement.width() ),
			nextElementNewSize = nextElementCurrentSize - difference;

		if ( newSize < 10 || newSize > 100 || ! difference || nextElementNewSize < 10 || nextElementNewSize > 100 ) {
			return;
		}

		// Set the current column size
		childView.model.setSetting( '_inline_size', newSize.toFixed( 3 ) );
		childView.changeSizeUI();

		// Set the next column size
		nextChildView.model.setSetting( '_inline_size', nextElementNewSize.toFixed( 3 ) );
		nextChildView.changeSizeUI();
	},

	onSettingsChanged: function() {
		BaseElementView.prototype.onSettingsChanged.apply( this, arguments );

		this.render();
	},

	onStructureChanged: function() {
		this.redefineLayout();
	}
} );

module.exports = SectionView;

},{"elementor-behaviors/duplicate":2,"elementor-behaviors/elements-relation":3,"elementor-behaviors/handle-duplicate":4,"elementor-behaviors/handle-edit-mode":5,"elementor-behaviors/handle-editor":6,"elementor-behaviors/sortable":8,"elementor-views/base-element":44,"elementor-views/column":45}],68:[function(require,module,exports){
var SectionView = require( 'elementor-views/section' ),
	SectionsCollectionView;

SectionsCollectionView = Marionette.CompositeView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-preview' ),

	id: 'elementor-inner',

	childViewContainer: '#elementor-section-wrap',

	childView: SectionView,

	ui: {
		addSectionArea: '#elementor-add-section',
		addNewSection: '#elementor-add-new-section',
		closePresetsIcon: '#elementor-select-preset-close',
		addIcon: '#elementor-add-section-button',
		selectPreset: '#elementor-select-preset',
		presets: '.elementor-preset'
	},

	events: {
		'click @ui.addIcon': 'showSelectPresets',
		'click @ui.closePresetsIcon': 'closeSelectPresets',
		'click @ui.presets': 'onPresetSelected'
	},

	behaviors: {
		Sortable: {
			behaviorClass: require( 'elementor-behaviors/sortable' ),
			elChildType: 'section'
		},
		HandleDuplicate: {
			behaviorClass: require( 'elementor-behaviors/handle-duplicate' )
		},
		HandleAdd: {
			behaviorClass: require( 'elementor-behaviors/duplicate' )
		},
		HandleElementsRelation: {
			behaviorClass: require( 'elementor-behaviors/elements-relation' )
		}
	},

	getSortableOptions: function() {
		return {
			handle: '> .elementor-container > .elementor-row > .elementor-column > .elementor-element-overlay .elementor-editor-section-settings-list .elementor-editor-element-trigger',
			items: '> .elementor-section'
		};
	},

	getChildType: function() {
		return [ 'section' ];
	},

	isCollectionFilled: function() {
		return false;
	},

	initialize: function() {
		if ( 1 > this.collection.length ) {
			this.addChildModel( {
				id: elementor.helpers.getUniqueID(),
				elType: 'section',
				settings: {},
				elements: []
			} );
		}
	},

	addChildModel: function( model, options ) {
		return this.collection.add( model, options, true );
	},

	addSection: function( properties ) {
		var newSection = {
			id: elementor.helpers.getUniqueID(),
			elType: 'section',
			settings: {},
			elements: []
		};

		if ( properties ) {
			_.extend( newSection, properties );
		}

		var newModel = this.addChildModel( newSection );

		return this.children.findByModelCid( newModel.cid );
	},

	showSelectPresets: function() {
		this.ui.addNewSection.hide();
		this.ui.selectPreset.show();
	},

	closeSelectPresets: function() {
		this.ui.addNewSection.show();
		this.ui.selectPreset.hide();
	},

	onRender: function() {
		var self = this;

		self.ui.addSectionArea.html5Droppable( {
			axis: [ 'vertical' ],
			groups: [ 'elementor-element' ],
			onDragging: function( side ) {
				if ( self.ui.addSectionArea.data( 'side' ) !== side ) {
					self.ui.addSectionArea.attr( 'data-side', side );
				}
			},
			onDragLeave: function() {
				self.ui.addSectionArea.removeAttr( 'data-side' );
			},
			onDropping: function() {
				var elementView = elementor.panelElements.request( 'element:selected' ),
					newSection = self.addSection();

				var widgetData = {
					id: elementor.helpers.getUniqueID(),
					elType: 'widget',
					widgetType: elementView.model.get( 'widgetType' )
				};

				newSection.triggerMethod( 'request:add', widgetData );
			}
		} );
	},

	onPresetSelected: function( event ) {
		this.closeSelectPresets();

		var selectedStructure = event.currentTarget.dataset.structure,
			parsedStructure = elementor.presetsFactory.getParsedStructure( selectedStructure ),
			elements = [],
			loopIndex;

		for ( loopIndex = 0; loopIndex < parsedStructure.columnsCount; loopIndex++ ) {
			elements.push( {
				id: elementor.helpers.getUniqueID(),
				elType: 'column',
				settings: {},
				elements: []
			} );
		}

		var newSection = this.addSection( { elements: elements } );

		newSection.setStructure( selectedStructure );

		newSection.redefineLayout();
	}
} );

module.exports = SectionsCollectionView;

},{"elementor-behaviors/duplicate":2,"elementor-behaviors/elements-relation":3,"elementor-behaviors/handle-duplicate":4,"elementor-behaviors/sortable":8,"elementor-views/section":67}],69:[function(require,module,exports){
var BaseElementView = require( 'elementor-views/base-element' ),
	BaseSettingsModel = require( 'elementor-models/base-settings' ),
	WidgetView;

WidgetView = BaseElementView.extend( {
	_templateType: null,

	getTemplate: function() {
		if ( 'remote' !== this.getTemplateType() ) {
			return Marionette.TemplateCache.get( '#tmpl-elementor-widget-' + this.model.get( 'widgetType' ) + '-content' );
		} else {
			return _.template( '' );
		}
	},

	className: function() {
		return 'elementor-widget elementor-widget-' + this.model.get( 'widgetType' );
	},

	modelEvents: {
		'before:remote:render': 'onModelBeforeRemoteRender',
		'remote:render': 'onModelRemoteRender'
	},

	triggers: {
		'click > .elementor-element-overlay': {
			event: 'click:edit',
			stopPropagation: false
		},
		'click > .elementor-element-overlay .elementor-editor-add-element': 'click:add',
		'click > .elementor-element-overlay .elementor-editor-element-duplicate': 'click:duplicate'
	},

	ui: {
		settings: '> .elementor-element-overlay .elementor-editor-widget-settings'
	},

	elementEvents: {
		'click': 'showSettings',
		'mouseleave @ui.settings': 'hideSettings',
		'click > .elementor-element-overlay .elementor-editor-element-remove': 'onClickRemove'
	},

	behaviors: {
		HandleEditor: {
			behaviorClass: require( 'elementor-behaviors/handle-editor' )
		},
		HandleEditMode: {
			behaviorClass: require( 'elementor-behaviors/handle-edit-mode' )
		}
	},

	initialize: function() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		if ( ! this.model.getHtmlCache() ) {
			this.model.renderRemoteServer();
		}
	},

	getTemplateType: function() {
		if ( null === this.getOption( '_templateType' ) ) {
			var $template = Backbone.$( '#tmpl-elementor-widget-' + this.model.get( 'widgetType' ) + '-content' );

			if ( 0 === $template.length ) {
				this._templateType = 'remote';
			} else {
				this._templateType = 'js';
			}
		}

		return this.getOption( '_templateType' );
	},

	onModelBeforeRemoteRender: function() {
		this.$el.addClass( 'elementor-loading' );
	},

	onBeforeDestroy: function() {
		// Remove old style from the DOM.
		elementor.$previewContents.find( '#elementor-style-' + this.model.cid ).remove();
	},

	onModelRemoteRender: function() {
		if ( this.isDestroyed ) {
			return;
		}

		this.$el.removeClass( 'elementor-loading' );
		this.render();
	},

	onSettingsChanged: function( settings ) {
		BaseElementView.prototype.onSettingsChanged.apply( this, arguments );

		// Make sure is correct model
		if ( settings instanceof BaseSettingsModel ) {
			var isContentChanged = false;

			_.each( settings.changedAttributes(), function( settingValue, settingKey ) {
				if ( ! settings.isStyleControl( settingKey ) && ! settings.isClassControl( settingKey ) ) {
					isContentChanged = true;
				}
			} );

			if ( ! isContentChanged ) {
				return;
			}
		}

		switch ( this.getTemplateType() ) {
			case 'js' :
				this.model.setHtmlCache();
				this.render();
				break;

			default :
				this.model.renderRemoteServer();
		}
	},

	attachElContent: function( html ) {
		var htmlCache = this.model.getHtmlCache();

		if ( htmlCache ) {
			html = htmlCache;
		}

		this.$el.html( html );

		return this;
	},

	onRender: function() {
		this.$el
			.removeClass( 'elementor-widget-empty' )
			.find( '> .elementor-element-overlay .elementor-widget-empty-icon' ).remove();

		this.$el.imagesLoaded().always( _.bind( function() {
			// Is element empty?
			if ( 1 > this.$el.height() ) {
				this.$el.addClass( 'elementor-widget-empty' );

				// TODO: REMOVE THIS !!
				// TEMP CODING !!
				this.$( '> .elementor-element-overlay' ).append( '<i class="elementor-widget-empty-icon eicon-' + this.model.getIcon() + '"></i>' );
			}
		}, this ) );
	},

	showSettings: function( event ) {
		var positionSettings = {
			my: elementor.config.is_rtl ? 'right+15 center' : 'left-15 center',
			of: event,
			collision: 'fit',
			within: this.$el
		};

		this.ui.settings.addClass( 'elementor-open' ).position( positionSettings );
	},

	hideSettings: function() {
		this.ui.settings.removeClass( 'elementor-open' );
	}
} );

module.exports = WidgetView;

},{"elementor-behaviors/handle-edit-mode":5,"elementor-behaviors/handle-editor":6,"elementor-models/base-settings":32,"elementor-views/base-element":44}]},{},[1])
//# sourceMappingURL=app.js.map
