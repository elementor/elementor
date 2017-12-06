var TagControlsStack = require( 'elementor-micro-elements/tag-controls-stack' ),
	SettingsModel = require( 'elementor-elements/models/base-settings' );

module.exports = Marionette.ItemView.extend( {
	mentionPopup: null,

	tagControlsStack: null,

	events: {
		click: 'onClick'
	},

	getTemplate: function() {
		var config = this.getTagConfig();

		return Marionette.TemplateCache.prototype.compileTemplate( config.title + ' ' + config.mention_template );
	},

	getTagConfig: function() {
		return elementor.microElements.getConfig( 'tags.' + this.getOption( 'name' ) );
	},

	initMentionsPopup: function() {
		var positionFromLeft = 7,
			positionFromTop = -10;

		if ( this.getOption( 'isInsidePreview' ) ) {
			positionFromLeft += elementor.panel.$el.width();

			positionFromTop -= elementorFrontend.getElements( 'window' ).pageYOffset;
		}

		this.mentionPopup = elementor.dialogsManager.createWidget( 'buttons', {
			className: 'elementor-mentions-popup',
			position: {
				my: 'left+' + positionFromLeft + ' top+' + positionFromTop,
				at: 'right top',
				of: this.el
			}
		} );
	},

	getMentionsPopup: function() {
		if ( ! this.mentionPopup ) {
			this.initMentionsPopup();
		}

		return this.mentionPopup;
	},

	initTagControlsStack: function() {
		this.tagControlsStack = new TagControlsStack( {
			model: this.model,
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
		this.initModel();

		this.initMentionsPopup();

		this.model.on( 'change', this.render );
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

		this.getMentionsPopup().show();
	}
} );
