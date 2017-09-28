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
			'keyup @ui.inlineEditingArea':'onInlineEditingUpdate'
		};
	},

	startInlineEditing: function() {
		if ( this.inlineEditing ) {
			return;
		}

		var editModel = this.view.getEditModel();

		this.$inlineEditingArea.html( editModel.getSetting( this.$inlineEditingArea.data( 'elementor-setting-key' ) ) );

		var Pen = elementorFrontend.getElements( 'window' ).Pen;

		this.inlineEditing = true;

		this.view.allowRender = false;

		var inlineEditingConfig = elementor.getElementData( editModel ).inlineEditing;

		this.pen = new Pen( {
			linksInNewWindow: true,
			stay: false,
			editor: this.$inlineEditingArea[ 0 ],
			list: inlineEditingConfig.buttons
		} );

		var $menu = jQuery( this.pen._menu ),
			$menuItems = $menu.children();

		$menu.on( 'click', _.bind( this.onInlineEditingUpdate, this ) );

		$menuItems.on( 'mousedown', function( event ) {
			event.preventDefault();
		} );

		this.$inlineEditingArea
			.focus()
			.on( 'blur', _.bind( this.onInlineEditingBlur, this ) );

		this.view.triggerMethod( 'inline:editing:start' );
	},

	stopInlineEditing: function() {
		this.inlineEditing = false;

		this.pen.destroy();

		this.view.triggerMethod( 'inline:editing:stop' );
	},

	renderOnStop: function() {
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

			if ( $focusNode.hasClass( 'pen-input-wrapper' ) ) {
				return;
			}

			self.stopInlineEditing();

			if (
				$focusNode.closest( self.view.el ).length &&
				$focusNode.closest( '.' + self.getOption( 'inlineEditingClass' ) ).length
			) { // There is another inline editing active it this widget
				return;
			}

			self.renderOnStop();
		}, 150 );
	},

	onInlineEditingUpdate: function() {
		var settingKey = this.$inlineEditingArea.data( 'elementor-setting-key' );

		this.view.getEditModel().setSetting( settingKey, this.$inlineEditingArea.html() );
	}
} );

module.exports = InlineEditingBehavior;
