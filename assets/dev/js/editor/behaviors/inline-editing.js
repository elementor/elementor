var InlineEditingBehavior;

InlineEditingBehavior = Marionette.Behavior.extend( {
	inlineEditing: false,

	$inlineEditingArea: null,

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

	startInlineEditing: function() {
		if ( this.inlineEditing ) {
			return;
		}

		var editModel = this.view.getEditModel(),
			elementData = this.$inlineEditingArea.data();

		this.$inlineEditingArea.html( editModel.getSetting( elementData.elementorSettingKey ) );

		var Pen = elementorFrontend.getElements( 'window' ).Pen;

		this.inlineEditing = true;

		this.view.allowRender = false;

		var inlineEditingConfig = elementor.config.inlineEditing,
			elementDataToolbar = elementData.elementorInlineEditingToolbar;

		this.pen = new Pen( {
			linksInNewWindow: true,
			stay: false,
			editor: this.$inlineEditingArea[ 0 ],
			list: 'none' === elementDataToolbar ? [] : inlineEditingConfig.toolbar[ elementDataToolbar || 'basic' ],
			toolbarIconsPrefix: 'eicon-',
			toolbarIconsDictionary: {
				externalLink: {
					className: 'eicon-external-link'
				},
				list: {
					className: 'eicon-list-ul'
				},
				insertOrderedList: {
					className: 'eicon-list-ol'
				},
				insertUnorderedList: {
					className: 'eicon-list-ul'
				},
				createlink: {
					className: 'eicon-link'
				},
				unlink: {
					className: 'fa fa-chain-broken'
				},
				blockquote: {
					className: 'eicon-quote'
				},
				p: {
					className: 'eicon-paragraph'
				},
				pre: {
					className: 'eicon-code'
				}
			}
		} );

		var $menuItems = jQuery( this.pen._menu ).children();

		$menuItems.on( 'mousedown', function( event ) {
			event.preventDefault();
		} );

		this.$inlineEditingArea
			.focus()
			.on( 'blur', _.bind( this.onInlineEditingBlur, this ) );
	},

	stopInlineEditing: function() {
		this.inlineEditing = false;

		this.pen.destroy();

		this.view.allowRender = true;

		this.view.getEditModel().renderRemoteServer();
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

			self.stopInlineEditing();
		}, 150 );
	},

	onInlineEditingUpdate: function() {
		var settingKey = this.$inlineEditingArea.data( 'elementor-setting-key' );

		this.view.getEditModel().setSetting( settingKey, this.$inlineEditingArea.html() );
	}
} );

module.exports = InlineEditingBehavior;
