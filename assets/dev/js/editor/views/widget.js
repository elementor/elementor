var BaseElementView = require( 'elementor-views/base-element' ),
	WidgetView;

WidgetView = BaseElementView.extend( {
	_templateType: null,

	getTemplate: function() {
		if ( 'remote' !== this.getTemplateType() ) {
			return Marionette.TemplateCache.get( '#tmpl-elementor-' + this.model.get( 'elType' ) + '-' + this.model.get( 'widgetType' ) + '-content' );
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
		'click': {
			event: 'click:edit',
			stopPropagation: false
		},
		'click > .elementor-editor-element-settings .elementor-editor-add-element': 'click:add',
		'click > .elementor-editor-element-settings .elementor-editor-element-duplicate': 'click:duplicate'
	},

	elementEvents: {
		'click > .elementor-editor-element-settings .elementor-editor-element-remove': 'onClickRemove'
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
		if ( null === this._templateType ) {
			var $template = Backbone.$( '#tmpl-elementor-' + this.model.get( 'elType' ) + '-' + this.model.get( 'widgetType' ) + '-content' );

			if ( 0 === $template.length ) {
				this._templateType = 'remote';
			} else {
				this._templateType = 'js';
			}
		}

		return this._templateType;
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

	attachElContent: function( html ) {
		var htmlCache = this.model.getHtmlCache();

		if ( htmlCache ) {
			html = htmlCache;
		}

		//this.$el.html( html );
		_.defer( _.bind( function() {
			elementorFrontend.getScopeWindow().jQuery( '#' + this.getElementUniqueClass() ).html( html );
		}, this ) );

		return this;
	},

	onRender: function() {
        var self = this;

        self.$el
            .removeClass( 'elementor-widget-empty' )
            .children( '.elementor-widget-empty-icon' )
            .remove();

        self.$el.imagesLoaded().always( function() {

            setTimeout( function() {
                if ( 1 > self.$el.height() ) {
                    self.$el.addClass( 'elementor-widget-empty' );

                    // TODO: REMOVE THIS !!
                    // TEMP CODING !!
                    self.$el.append( '<i class="elementor-widget-empty-icon eicon-' + self.model.getIcon() + '"></i>' );
                }
            }, 200 );
            // Is element empty?
        } );
	}
} );

module.exports = WidgetView;
