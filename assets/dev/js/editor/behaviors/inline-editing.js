var InlineEditingBehavior;

InlineEditingBehavior = Marionette.Behavior.extend( {
	editing: false,

	$currentEditingArea: null,

	ui: function() {
		return {
			inlineEditingArea: '.' + this.getOption( 'inlineEditingClass' )
		};
	},

	events: function() {
		return {
			'click @ui.inlineEditingArea': 'onInlineEditingClick',
			'input @ui.inlineEditingArea':'onInlineEditingUpdate'
		};
	},

	getEditingSettingKey: function() {
		return this.$currentEditingArea.data().elementorSettingKey;
	},

	startEditing: function( $element ) {
		if ( this.editing ) {
			return;
		}

		this.$currentEditingArea = $element;

		var elementData = this.$currentEditingArea.data(),
			editModel = this.view.getEditModel();

		this.$currentEditingArea.html( editModel.getSetting( this.getEditingSettingKey() ) );

		var Pen = elementorFrontend.getElements( 'window' ).Pen;

		this.editing = true;

		this.view.allowRender = false;

		var inlineEditingConfig = elementor.config.inlineEditing,
			elementDataToolbar = elementData.elementorInlineEditingToolbar;

		this.pen = new Pen( {
			linksInNewWindow: true,
			stay: false,
			editor: this.$currentEditingArea[0],
			list: 'none' === elementDataToolbar ? [] : inlineEditingConfig.toolbar[ elementDataToolbar || 'basic' ],
			toolbarIconsPrefix: 'eicon-editor-',
			toolbarIconsDictionary: {
				externalLink: {
					className: 'eicon-editor-external-link'
				},
				list: {
					className: 'eicon-editor-list-ul'
				},
				insertOrderedList: {
					className: 'eicon-editor-list-ol'
				},
				insertUnorderedList: {
					className: 'eicon-editor-list-ul'
				},
				createlink: {
					className: 'eicon-editor-link'
				},
				unlink: {
					className: 'eicon-editor-unlink'
				},
				blockquote: {
					className: 'eicon-editor-quote'
				},
				p: {
					className: 'eicon-editor-paragraph'
				},
				pre: {
					className: 'eicon-editor-code'
				}
			}
		} );

		var $menuItems = jQuery( this.pen._menu ).children();

		$menuItems.on( 'mousedown', function( event ) {
			event.preventDefault();
		} );

		this.$currentEditingArea
			.focus()
			.on( 'blur', _.bind( this.onInlineEditingBlur, this ) );
	},

	stopEditing: function() {
		this.editing = false;

		this.pen.destroy();

		this.view.allowRender = true;

		if ( 'advanced' === this.$currentEditingArea.data().elementorInlineEditingToolbar ) {
			this.view.getEditModel().renderRemoteServer();
		}
	},

	onInlineEditingClick: function( event ) {
		this.$inlineEditingArea = jQuery( event.currentTarget );

		this.startInlineEditing();
	},

	onInlineEditingBlur: function() {
		var self = this;

		setTimeout( function() {
			var selection = elementorFrontend.getElements( 'window' ).getSelection(),
				$focusNode = jQuery( selection.focusNode );

			if ( $focusNode.closest( '.pen-input-wrapper' ).length ) {
				return;
			}

		}, 150 );
			self.stopEditing();
	},

	onInlineEditingUpdate: function() {
		this.view.getEditModel().setSetting( this.getEditingSettingKey(), this.$currentEditingArea.html() );
	}
} );

module.exports = InlineEditingBehavior;
