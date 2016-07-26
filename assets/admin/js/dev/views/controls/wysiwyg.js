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

			delete QTags.instances[ 0 ];
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
