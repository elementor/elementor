var TagControlsStack = require( 'elementor-micro-elements/tag-controls-stack' ),
	SettingsModel = require( 'elementor-elements/models/base-settings' );

module.exports = Marionette.ItemView.extend( {
	tagControlsStack: null,

	ui: {
		remove: '.atwho-remove'
	},

	events: {
		click: 'onClick',
		'click @ui.remove': 'onRemoveClick'
	},

	getTemplate: function() {
		var config = this.getTagConfig();

		return Marionette.TemplateCache.prototype.compileTemplate( config.title + ' ' + config.mention_template );
	},

	getTagConfig: function() {
		return elementor.microElements.getConfig( 'tags.' + this.getOption( 'name' ) );
	},

	initMentionsPopup: function() {
		var mentionsPopupOptions = {
			className: 'elementor-mentions-popup',
			position: {
				at: 'right top',
				of: this.el,
				autoRefresh: true
			}
		};

		var $iframe = this.getOption( '$iframe' );

		if ( $iframe ) {
			var iframeWindow = $iframe[0].contentWindow,
				mentionsPopupHideMethod;

			mentionsPopupOptions.onShow = function() {
				mentionsPopupHideMethod = this.hide.bind( this );

				iframeWindow.addEventListener( 'click', mentionsPopupHideMethod, true );
			};

			mentionsPopupOptions.onHide = function() {
				iframeWindow.removeEventListener( 'click', mentionsPopupHideMethod, true );
			};
		}

		var mentionPopup = elementor.dialogsManager.createWidget( 'buttons', mentionsPopupOptions );

		this.getMentionsPopup = function() {
			return mentionPopup;
		};
	},

	showMentionsPopup: function() {
		var positionFromLeft = 7,
			positionFromTop = -10,
			$iframe = this.getOption( '$iframe' ),
			mentionsPopup = this.getMentionsPopup();

		if ( $iframe ) {
			var offset = $iframe.offset();

			positionFromLeft += offset.left;

			positionFromTop -=  $iframe[0].contentWindow.pageYOffset - offset.top;
		}

		mentionsPopup.setSettings( 'position', {
			my: 'left+' + positionFromLeft + ' top+' + positionFromTop
		} );

		mentionsPopup.show();
	},

	initTagControlsStack: function() {
		this.tagControlsStack = new TagControlsStack( {
			model: this.model,
			controls: this.model.controls,
			el: this.getMentionsPopup().getElements( 'message' )[0]
		} );
	},

	getTagControlsStack: function() {
		if ( ! this.tagControlsStack ) {
			this.initTagControlsStack();
		}

		return this.tagControlsStack;
	},

	initModel: function() {
		this.model = new SettingsModel( this.getOption( 'settings' ), {
			controls: this.getTagConfig().controls
		} );
	},

	initialize: function() {
		if ( ! this.getTagConfig().controls ) {
			return;
		}

		this.initModel();

		this.initMentionsPopup();

		this.listenTo( this.model, 'change', this.render );
	},

	onRender: function() {
		this.$el.attr( {
			'data-tag-name': this.getOption( 'name' ),
			'data-tag-id': this.getOption( 'id' ),
			'data-elementor-settings': JSON.stringify( this.model )
		} );
	},

	onClick: function() {
		this.getTagControlsStack().render();

		this.showMentionsPopup();
	},

	onRemoveClick: function( event ) {
		event.stopPropagation();

		this.destroy();

		this.trigger( 'remove' );
	},

	onDestroy: function() {
		this.getMentionsPopup().destroy();
	}
} );
