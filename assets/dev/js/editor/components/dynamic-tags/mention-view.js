var TagControlsStack = require( 'elementor-dynamic-tags/tag-controls-stack' ),
	SettingsModel = require( 'elementor-elements/models/base-settings' );

module.exports = Marionette.ItemView.extend( {

	className: 'elementor-dynamic-cover',

	tagControlsStack: null,

	ui: {
		settings: '.elementor-dynamic-cover__tool--settings',
		remove: '.elementor-dynamic-cover__tool--remove'
	},

	events: {
		'click @ui.settings': 'onSettingsClick',
		'click @ui.remove': 'onRemoveClick'
	},

	getTemplate: function() {
		var config = this.getTagConfig(),
			templateFunction = Marionette.TemplateCache.get( '#tmpl-elementor-control-dynamic-cover' ),
			renderedTemplate = Marionette.Renderer.render( templateFunction, {
				title: config.title,
				content: config.mention_template
			} );

		return Marionette.TemplateCache.prototype.compileTemplate( renderedTemplate.trim() );
	},

	getTagConfig: function() {
		return elementor.dynamicTags.getConfig( 'tags.' + this.getOption( 'name' ) );
	},

	initMentionsPopup: function() {
		var mentionsPopupOptions = {
			className: 'elementor-mentions-popup',
			position: {
				at: 'right top',
				of: this.ui.settings,
				autoRefresh: true
			}
		};

		var mentionPopup = elementor.dialogsManager.createWidget( 'buttons', mentionsPopupOptions );

		this.getMentionsPopup = function() {
			return mentionPopup;
		};
	},

	showMentionsPopup: function() {
		var mentionsPopup = this.getMentionsPopup();

		if ( mentionsPopup.isVisible() ) {
			return;
		}

		var positionFromLeft = 15,
			positionFromTop = -15;

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

	onSettingsClick: function() {
		this.getTagControlsStack().render();

		this.showMentionsPopup();
	},

	onRemoveClick: function() {
		this.destroy();

		this.trigger( 'remove' );
	},

	onDestroy: function() {
		this.getMentionsPopup().destroy();
	}
} );
