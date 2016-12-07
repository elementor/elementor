var BaseElementView = require( 'elementor-views/base-element' ),
	WidgetView;

WidgetView = BaseElementView.extend( {
	_templateType: null,

	getTemplate: function() {
		var editModel = this.getEditModel();

		if ( 'remote' !== this.getTemplateType() ) {
			return Marionette.TemplateCache.get( '#tmpl-elementor-' + editModel.get( 'elType' ) + '-' + editModel.get( 'widgetType' ) + '-content' );
		} else {
			return _.template( '' );
		}
	},

	className: function() {
		return 'elementor-widget';
	},

	events: function() {
		var events = BaseElementView.prototype.events.apply( this, arguments );

		events.click = 'onClickEdit';

		return events;
	},

	initialize: function() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		var editModel = this.getEditModel();

		if ( 'remote' === this.getTemplateType() && ! this.getEditModel().getHtmlCache() ) {
			editModel.renderRemoteServer();
		}

		editModel.on( {
			'before:remote:render': _.bind( this.onModelBeforeRemoteRender, this ),
			'remote:render': _.bind( this.onModelRemoteRender, this )
		} );
	},

	getTemplateType: function() {
		if ( null === this._templateType ) {
			var editModel = this.getEditModel(),
				$template = Backbone.$( '#tmpl-elementor-' + editModel.get( 'elType' ) + '-' + editModel.get( 'widgetType' ) + '-content' );

			this._templateType = $template.length ? 'js' : 'remote';
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

	getHTMLContent: function( html ) {
		var htmlCache = this.getEditModel().getHtmlCache();

		return htmlCache || html;
	},

	attachElContent: function( html ) {
		var htmlContent = this.getHTMLContent( html );

		//this.$el.html( html );
		_.defer( _.bind( function() {
			elementorFrontend.getScopeWindow().jQuery( '#' + this.getElementUniqueID() ).html( htmlContent );
		}, this ) );

		return this;
	},

	onRender: function() {
        var self = this,
	        editModel = self.getEditModel(),
	        skinType = editModel.getSetting( '_skin' ) || 'default';

        self.$el
	        .attr( 'data-element_type', editModel.get( 'widgetType' ) + '.' + skinType )
            .removeClass( 'elementor-widget-empty' )
	        .addClass( 'elementor-widget-' + editModel.get( 'widgetType' ) + ' elementor-widget-can-edit' )
            .children( '.elementor-widget-empty-icon' )
            .remove();

        self.$el.imagesLoaded().always( function() {

            setTimeout( function() {
                if ( 1 > self.$el.height() ) {
                    self.$el.addClass( 'elementor-widget-empty' );

                    // TODO: REMOVE THIS !!
                    // TEMP CODING !!
                    self.$el.append( '<i class="elementor-widget-empty-icon ' + editModel.getIcon() + '"></i>' );
                }
            }, 200 );
            // Is element empty?
        } );
	}
} );

module.exports = WidgetView;
