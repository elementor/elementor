var TagControlsStack = require( 'elementor-dynamic-tags/tag-controls-stack' );

module.exports = Marionette.ItemView.extend( {

	className: 'elementor-dynamic-cover e-input-style',

	tagControlsStack: null,

	templateHelpers() {
		var helpers = {};
		if ( this.model ) {
			helpers.controls = this.model.options.controls;
		}

		return helpers;
	},

	ui: {
		remove: '.elementor-dynamic-cover__remove',
	},

	events() {
		var events = {
			'click @ui.remove': 'onRemoveClick',
		};

		if ( this.hasSettings() ) {
			events.click = 'onClick';
		}

		return events;
	},

	getTemplate() {
		var config = this.getTagConfig(),
			templateFunction = Marionette.TemplateCache.get( '#tmpl-elementor-control-dynamic-cover' ),
			renderedTemplate = Marionette.Renderer.render( templateFunction, {
				hasSettings: this.hasSettings(),
				isRemovable: ! this.getOption( 'dynamicSettings' ).default,
				title: config.title,
				content: config.panel_template,
			} );

		return Marionette.TemplateCache.prototype.compileTemplate( renderedTemplate.trim() );
	},

	getTagConfig() {
		return elementor.dynamicTags.getConfig( 'tags.' + this.getOption( 'name' ) );
	},

	initSettingsPopup() {
		var settingsPopupOptions = {
			className: 'elementor-tag-settings-popup',
			position: {
				my: 'left top+5',
				at: 'left bottom',
				of: this.$el,
				autoRefresh: true,
			},
			hide: {
				ignore: '.select2-container',
			},
		};

		var settingsPopup = elementorCommon.dialogsManager.createWidget( 'buttons', settingsPopupOptions );

		this.getSettingsPopup = function() {
			return settingsPopup;
		};
	},

	hasSettings() {
		return !! Object.values( this.getTagConfig().controls ).length;
	},

	showSettingsPopup() {
		if ( ! this.tagControlsStack ) {
			this.initTagControlsStack();
		}

		var settingsPopup = this.getSettingsPopup();

		if ( settingsPopup.isVisible() ) {
			return;
		}

		settingsPopup.show();
	},

	initTagControlsStack() {
		this.tagControlsStack = new TagControlsStack( {
			model: this.model,
			controls: this.model.controls,
			name: this.options.name,
			controlName: this.options.controlName,
			container: this.options.container,
			el: this.getSettingsPopup().getElements( 'message' )[ 0 ],
		} );

		this.tagControlsStack.render();
	},

	initModel() {
		this.model = new elementorModules.editor.elements.models.BaseSettings( this.getOption( 'settings' ), {
			controls: this.getTagConfig().controls,
		} );
	},

	initialize() {
		// The `model` should always be available.
		this.initModel();

		if ( ! this.hasSettings() ) {
			return;
		}

		this.initSettingsPopup();

		this.listenTo( this.model, 'change', this.render );
	},

	onClick() {
		this.showSettingsPopup();
	},

	onRemoveClick( event ) {
		event.stopPropagation();

		this.destroy();

		this.trigger( 'remove' );
	},

	onDestroy() {
		if ( this.hasSettings() ) {
			this.getSettingsPopup().destroy();
		}

		if ( this.tagControlsStack ) {
			this.tagControlsStack.destroy();
		}
	},
} );
