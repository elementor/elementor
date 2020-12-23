var InlineEditingBehavior;

InlineEditingBehavior = Marionette.Behavior.extend( {
	editing: false,

	$currentEditingArea: null,

	ui: function() {
		return {
			inlineEditingArea: '.' + this.getOption( 'inlineEditingClass' ),
		};
	},

	events: function() {
		return {
			'click @ui.inlineEditingArea': 'onInlineEditingClick',
			'input @ui.inlineEditingArea': 'onInlineEditingUpdate',
		};
	},

	initialize: function() {
		this.onInlineEditingBlur = this.onInlineEditingBlur.bind( this );
	},

	getEditingSettingKey: function() {
		return this.$currentEditingArea.data().elementorSettingKey;
	},

	startEditing: function( $element ) {
		if (
			this.editing ||
			! this.view.container.isEditable() ||
			this.view.model.isRemoteRequestActive()
		) {
			return;
		}

		var elementorSettingKey = $element.data().elementorSettingKey,
			settingKey = elementorSettingKey,
			keyParts = elementorSettingKey.split( '.' ),
			isRepeaterKey = 3 === keyParts.length,
			settingsModel = this.view.getEditModel().get( 'settings' );

		if ( isRepeaterKey ) {
			settingsModel = settingsModel.get( keyParts[ 0 ] ).models[ keyParts[ 1 ] ];

			settingKey = keyParts[ 2 ];
		}

		var dynamicSettings = settingsModel.get( '__dynamic__' ),
			isDynamic = dynamicSettings && dynamicSettings[ settingKey ];

		if ( isDynamic ) {
			return;
		}

		this.$currentEditingArea = $element;

		var elementData = this.$currentEditingArea.data(),
			elementDataToolbar = elementData.elementorInlineEditingToolbar,
			mode = 'advanced' === elementDataToolbar ? 'advanced' : 'basic',
			editModel = this.view.getEditModel(),
			inlineEditingConfig = elementor.config.inlineEditing,
			contentHTML = editModel.getSetting( this.getEditingSettingKey() );

		if ( 'advanced' === mode ) {
			contentHTML = wp.editor.autop( contentHTML );
		}

		/**
		 *  Replace rendered content with unrendered content.
		 *  This way the user can edit the original content, before shortcodes and oEmbeds are fired.
		 */
		this.$currentEditingArea.html( contentHTML );

		var ElementorInlineEditor = elementorFrontend.elements.window.ElementorInlineEditor;

		this.editing = true;

		this.view.allowRender = false;

		// Avoid retrieving of old content (e.g. in case of sorting)
		this.view.model.setHtmlCache( '' );

		this.editor = new ElementorInlineEditor( {
			linksInNewWindow: true,
			stay: false,
			editor: this.$currentEditingArea[ 0 ],
			mode: mode,
			list: 'none' === elementDataToolbar ? [] : inlineEditingConfig.toolbar[ elementDataToolbar || 'basic' ],
			cleanAttrs: [ 'id', 'class', 'name' ],
			placeholder: __( 'Type Here', 'elementor' ) + '...',
			toolbarIconsPrefix: 'eicon-editor-',
			toolbarIconsDictionary: {
				externalLink: {
					className: 'eicon-editor-external-link',
				},
				list: {
					className: 'eicon-editor-list-ul',
				},
				insertOrderedList: {
					className: 'eicon-editor-list-ol',
				},
				insertUnorderedList: {
					className: 'eicon-editor-list-ul',
				},
				createlink: {
					className: 'eicon-editor-link',
				},
				unlink: {
					className: 'eicon-editor-unlink',
				},
				blockquote: {
					className: 'eicon-editor-quote',
				},
				p: {
					className: 'eicon-editor-paragraph',
				},
				pre: {
					className: 'eicon-editor-code',
				},
			},
		} );

		var $menuItems = jQuery( this.editor._menu ).children();

		/**
		 * When the edit area is not focused (on blur) the inline editing is stopped.
		 * In order to prevent blur event when the user clicks on toolbar buttons while editing the
		 * content, we need the prevent their mousedown event. This also prevents the blur event.
		 */
		$menuItems.on( 'mousedown', function( event ) {
			event.preventDefault();
		} );

		this.$currentEditingArea.on( 'blur', this.onInlineEditingBlur );

		elementorCommon.elements.$body.on( 'mousedown', this.onInlineEditingBlur );
	},

	stopEditing: function() {
		this.editing = false;

		this.$currentEditingArea.off( 'blur', this.onInlineEditingBlur );

		elementorCommon.elements.$body.off( 'mousedown', this.onInlineEditingBlur );

		this.editor.destroy();

		this.view.allowRender = true;

		/**
		 * Inline editing has several toolbar types (advanced, basic and none). When editing is stopped,
		 * we need to rerender the area. To prevent multiple renderings, we will render only areas that
		 * use advanced toolbars.
		 */
		if ( 'advanced' === this.$currentEditingArea.data().elementorInlineEditingToolbar ) {
			this.view.getEditModel().renderRemoteServer();
		}
	},

	onInlineEditingClick: function( event ) {
		var self = this,
			$targetElement = jQuery( event.currentTarget );

		/**
		 * When starting inline editing we need to set timeout, this allows other inline items to finish
		 * their operations before focusing new editing area.
		 */
		setTimeout( function() {
			self.startEditing( $targetElement );
		}, 30 );
	},

	onInlineEditingBlur: function( event ) {
		if ( 'mousedown' === event.type ) {
			this.stopEditing();

			return;
		}

		/**
		 * When exiting inline editing we need to set timeout, to make sure there is no focus on internal
		 * toolbar action. This prevent the blur and allows the user to continue the inline editing.
		 */
		setTimeout( () => {
			const selection = elementorFrontend.elements.window.getSelection(),
				$focusNode = jQuery( selection.focusNode );

			if ( $focusNode.closest( '.pen-input-wrapper' ).length ) {
				return;
			}

			this.stopEditing();
		}, 20 );
	},

	onInlineEditingUpdate: function() {
		let key = this.getEditingSettingKey(),
			container = this.view.getContainer();

		const parts = key.split( '.' );

		// Is it repeater?
		if ( 3 === parts.length ) {
			container = container.children[ parts[ 1 ] ];
			key = parts[ 2 ];
		}

		$e.run( 'document/elements/settings', {
			container,
			settings: {
				[ key ]: this.editor.getContent(),
			},
			options: {
				external: true,
			},
		} );
	},
} );

module.exports = InlineEditingBehavior;
