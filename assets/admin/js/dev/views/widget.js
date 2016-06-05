var BaseElementView = require( 'elementor-views/base-element' ),
	BaseSettingsModel = require( 'elementor-models/base-settings' ),
	WidgetView;

WidgetView = BaseElementView.extend( {
	_templateType: null,

	getTemplate: function() {
		if ( 'remote' !== this.getTemplateType() ) {
			return Marionette.TemplateCache.get( '#tmpl-elementor-widget-' + this.model.get( 'widgetType' ) + '-content' );
		} else {
			return _.template( '' );
		}
	},

	className: function() {
		return 'elementor-widget elementor-widget-' + this.model.get( 'widgetType' );
	},

	modelEvents: {
		'before:remote:render': 'onModelBeforeRemoteRender',
		'remote:render': 'onModelRemoteRender'
	},

	triggers: {
		'click > .elementor-element-overlay': {
			event: 'click:edit',
			stopPropagation: false
		},
		'click > .elementor-element-overlay .elementor-editor-add-element': 'click:add',
		'click > .elementor-element-overlay .elementor-editor-element-duplicate': 'click:duplicate'
	},

	ui: {
		settings: '> .elementor-element-overlay .elementor-editor-widget-settings'
	},

	elementEvents: {
		'click': 'showSettings',
		'mouseleave @ui.settings': 'hideSettings',
		'click > .elementor-element-overlay .elementor-editor-element-remove': 'onClickRemove'
	},

	behaviors: {
		HandleEditor: {
			behaviorClass: require( 'elementor-behaviors/handle-editor' )
		},
		HandleEditMode: {
			behaviorClass: require( 'elementor-behaviors/handle-edit-mode' )
		}
	},

	initialize: function() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		if ( ! this.model.getHtmlCache() ) {
			this.model.renderRemoteServer();
		}
	},

	getTemplateType: function() {
		if ( null === this.getOption( '_templateType' ) ) {
			var $template = Backbone.$( '#tmpl-elementor-widget-' + this.model.get( 'widgetType' ) + '-content' );

			if ( 0 === $template.length ) {
				this._templateType = 'remote';
			} else {
				this._templateType = 'js';
			}
		}

		return this.getOption( '_templateType' );
	},

	onModelBeforeRemoteRender: function() {
		this.$el.addClass( 'elementor-loading' );
	},

	onBeforeDestroy: function() {
		// Remove old style from the DOM.
		elementor.$previewContents.find( '#elementor-style-' + this.model.cid ).remove();
	},

	onModelRemoteRender: function() {
		if ( this.isDestroyed ) {
			return;
		}

		this.$el.removeClass( 'elementor-loading' );
		this.render();
	},

	onSettingsChanged: function( settings ) {
		BaseElementView.prototype.onSettingsChanged.apply( this, arguments );
		
		// Make sure is correct model
		if ( settings instanceof BaseSettingsModel ) {
			var isContentChanged = false;

			_.each( settings.changedAttributes(), function( settingValue, settingKey ) {
				if ( ! settings.isStyleControl( settingKey ) && ! settings.isClassControl( settingKey ) ) {
					isContentChanged = true;
				}
			} );

			if ( ! isContentChanged ) {
				return;
			}
		}

		switch ( this.getTemplateType() ) {
			case 'js' :
				this.model.setHtmlCache();
				this.render();
				break;

			default :
				this.model.renderRemoteServer();
		}
	},

	attachElContent: function( html ) {
		var htmlCache = this.model.getHtmlCache();

		if ( htmlCache ) {
			html = htmlCache;
		}

		this.$el.html( html );

		return this;
	},

	onRender: function() {
		this.$el
			.removeClass( 'elementor-widget-empty' )
			.find( '> .elementor-element-overlay .elementor-widget-empty-icon' ).remove();

		this.$el.imagesLoaded().always( _.bind( function() {
			// Is element empty?
			if ( 1 > this.$el.height() ) {
				this.$el.addClass( 'elementor-widget-empty' );

				// TODO: REMOVE THIS !!
				// TEMP CODING !!
				this.$( '> .elementor-element-overlay' ).append( '<i class="elementor-widget-empty-icon fa fa-' + this.model.getIcon() + '"></i>' );
			}
		}, this ) );
	},

	showSettings: function( event ) {
		var positionSettings = {
			my: elementor.config.is_rtl ? 'right+15 center' : 'left-15 center',
			of: event,
			collision: 'fit',
			within: this.$el
		};

		this.ui.settings.addClass( 'elementor-open' ).position( positionSettings );
	},

	hideSettings: function() {
		this.ui.settings.removeClass( 'elementor-open' );
	}
} );

module.exports = WidgetView;
