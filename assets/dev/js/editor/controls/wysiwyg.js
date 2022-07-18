var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlWysiwygItemView;

ControlWysiwygItemView = ControlBaseDataView.extend( {
	editor: null,

	ui() {
		var ui = ControlBaseDataView.prototype.ui.apply( this, arguments );

		jQuery.extend( ui, {
			inputWrapper: '.elementor-control-input-wrapper',
		} );

		return ui;
	},

	events() {
		return _.extend( ControlBaseDataView.prototype.events.apply( this, arguments ), {
			'keyup textarea.elementor-wp-editor': 'onBaseInputChange',
		} );
	},

	// List of buttons to move {buttonToMove: afterButton}
	buttons: {
		addToBasic: {
			underline: 'italic',
		},
		addToAdvanced: {},
		moveToAdvanced: {
			blockquote: 'removeformat',
			alignleft: 'blockquote',
			aligncenter: 'alignleft',
			alignright: 'aligncenter',
		},
		moveToBasic: {},
		removeFromBasic: [ 'unlink', 'wp_more' ],
		removeFromAdvanced: [],
	},

	initialize() {
		ControlBaseDataView.prototype.initialize.apply( this, arguments );

		var self = this;

		self.editorID = 'elementorwpeditor' + self.cid;

		// Wait a cycle before initializing the editors.
		_.defer( function() {
			if ( self.isDestroyed ) {
				return;
			}

			// Initialize QuickTags, and set as the default mode.
			quicktags( {
				buttons: 'strong,em,del,link,img,close',
				id: self.editorID,
			} );

			if ( elementor.config.rich_editing_enabled ) {
				switchEditors.go( self.editorID, 'tmce' );
			}

			delete QTags.instances[ 0 ];
		} );

		if ( ! elementor.config.rich_editing_enabled ) {
			self.$el.addClass( 'elementor-rich-editing-disabled' );

			return;
		}

		var editorConfig = {
			id: self.editorID,
			selector: '#' + self.editorID,
			setup( editor ) {
				self.editor = editor;
			},
		};

		tinyMCEPreInit.mceInit[ self.editorID ] = _.extend( _.clone( tinyMCEPreInit.mceInit.elementorwpeditor ), editorConfig );

		if ( ! elementor.config.tinymceHasCustomConfig ) {
			self.rearrangeButtons();
		}
	},

	applySavedValue() {
		if ( ! this.editor ) {
			return;
		}

		var controlValue = this.getControlValue();

		this.editor.setContent( controlValue );

		// Update also the plain textarea
		jQuery( '#' + this.editorID ).val( controlValue );
	},

	saveEditor() {
		this.setValue( this.editor.getContent() );
	},

	moveButtons( buttonsToMove, from, to ) {
		if ( ! to ) {
			to = from;

			from = null;
		}

		_.each( buttonsToMove, function( afterButton, button ) {
			var afterButtonIndex = to.indexOf( afterButton );

			if ( from ) {
				var buttonIndex = from.indexOf( button );

				if ( -1 === buttonIndex ) {
					throw new ReferenceError( 'Trying to move non-existing button `' + button + '`' );
				}

				from.splice( buttonIndex, 1 );
			}

			if ( -1 === afterButtonIndex ) {
				throw new ReferenceError( 'Trying to move button after non-existing button `' + afterButton + '`' );
			}

			to.splice( afterButtonIndex + 1, 0, button );
		} );
	},

	rearrangeButtons() {
		var editorProps = tinyMCEPreInit.mceInit[ this.editorID ],
			editorBasicToolbarButtons = editorProps.toolbar1.split( ',' ),
			editorAdvancedToolbarButtons = editorProps.toolbar2.split( ',' );

		editorBasicToolbarButtons = _.difference( editorBasicToolbarButtons, this.buttons.removeFromBasic );

		editorAdvancedToolbarButtons = _.difference( editorAdvancedToolbarButtons, this.buttons.removeFromAdvanced );

		this.moveButtons( this.buttons.moveToBasic, editorAdvancedToolbarButtons, editorBasicToolbarButtons );

		this.moveButtons( this.buttons.moveToAdvanced, editorBasicToolbarButtons, editorAdvancedToolbarButtons );

		this.moveButtons( this.buttons.addToBasic, editorBasicToolbarButtons );

		this.moveButtons( this.buttons.addToAdvanced, editorAdvancedToolbarButtons );

		editorProps.toolbar1 = editorBasicToolbarButtons.join( ',' );
		editorProps.toolbar2 = editorAdvancedToolbarButtons.join( ',' );
	},

	onReady() {
		const $editor = jQuery( elementor.config.wp_editor.replace( /elementorwpeditor/g, this.editorID ).replace( '%%EDITORCONTENT%%', '' ) );

		$editor.find( '.wp-editor-area' ).text( this.getControlValue() );

		$editor.find( `.wp-editor-tabs` ).addClass( 'elementor-control-dynamic-switcher-wrapper' );

		this.ui.inputWrapper.html( $editor );

		setTimeout( () => {
			if ( ! this.isDestroyed && this.editor ) {
				this.editor.on( 'keyup change undo redo', this.saveEditor.bind( this ) );
			}
		}, 100 );
	},

	onBeforeDestroy() {
		// Remove TinyMCE and QuickTags instances
		delete QTags.instances[ this.editorID ];

		if ( ! elementor.config.rich_editing_enabled ) {
			return;
		}

		tinymce.EditorManager.execCommand( 'mceRemoveEditor', true, this.editorID );

		// Cleanup PreInit data
		delete tinyMCEPreInit.mceInit[ this.editorID ];
		delete tinyMCEPreInit.qtInit[ this.editorID ];
	},
} );

module.exports = ControlWysiwygItemView;
