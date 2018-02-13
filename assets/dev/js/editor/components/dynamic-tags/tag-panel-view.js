var TagControlsStack = require( 'elementor-dynamic-tags/tag-controls-stack' ),
	SettingsModel = require( 'elementor-elements/models/base-settings' );

module.exports = Marionette.ItemView.extend( {

	className: 'elementor-dynamic-cover elementor-input-style',

	tagControlsStack: null,

	ui: {
		remove: '.elementor-dynamic-cover__remove'
	},

	events: {
		'click': 'onClick',
		'click @ui.remove': 'onRemoveClick'
	},

	getTemplate: function() {
		var config = this.getTagConfig(),
			templateFunction = Marionette.TemplateCache.get( '#tmpl-elementor-control-dynamic-cover' ),
			renderedTemplate = Marionette.Renderer.render( templateFunction, {
				title: config.title,
				content: config.panel_template
			} );

		return Marionette.TemplateCache.prototype.compileTemplate( renderedTemplate.trim() );
	},

	getTagConfig: function() {
		return elementor.dynamicTags.getConfig( 'tags.' + this.getOption( 'name' ) );
	},

	initSettingsPopup: function() {
		var settingsPopupOptions = {
			className: 'elementor-tag-settings-popup',
			position: {
				my: 'left top+5',
				at: 'left bottom',
				of: this.$el,
				autoRefresh: true
			}
		};

		var settingsPopup = elementor.dialogsManager.createWidget( 'buttons', settingsPopupOptions );

		this.getSettingsPopup = function() {
			return settingsPopup;
		};
	},

	showSettingsPopup: function() {
		var settingsPopup = this.getSettingsPopup();

		if ( settingsPopup.isVisible() ) {
			return;
		}

		settingsPopup.show();
	},

	initTagControlsStack: function() {
		this.tagControlsStack = new TagControlsStack( {
			model: this.model,
			controls: this.model.controls,
			el: this.getSettingsPopup().getElements( 'message' )[0]
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

		this.initSettingsPopup();

		this.listenTo( this.model, 'change', this.render );
	},

	onClick: function() {
		this.getTagControlsStack().render();

		this.showSettingsPopup();
	},

	onRemoveClick: function( event ) {
		event.stopPropagation();

		this.destroy();

		this.trigger( 'remove' );
	},

	onDestroy: function() {
		this.getSettingsPopup().destroy();
	}
} );
