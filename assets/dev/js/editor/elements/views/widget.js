var BaseElementView = require( 'elementor-elements/views/base' ),
	ContextMenu = require( 'elementor-editor-utils/context-menu' ),
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
		var baseClasses = BaseElementView.prototype.className.apply( this, arguments );

		return baseClasses + ' elementor-widget ' + elementor.getElementData( this.getEditModel() ).html_wrapper_class;
	},

	events: function() {
		var events = BaseElementView.prototype.events.apply( this, arguments );

		events.click = 'onClickEdit';

		if ( elementor.config.contextMenuEnabled ) {
			events.contextmenu = 'onContextMenu';
		}

		return events;
	},

	behaviors: function() {
		var behaviors = BaseElementView.prototype.behaviors.apply( this, arguments );

		_.extend( behaviors, {
			InlineEditing: {
				behaviorClass: require( 'elementor-behaviors/inline-editing' ),
				inlineEditingClass: 'elementor-inline-editing'
			}
		} );

		return elementor.hooks.applyFilters( 'elements/widget/behaviors', behaviors, this );
	},

	initialize: function() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		var editModel = this.getEditModel();

		editModel.on( {
			'before:remote:render': this.onModelBeforeRemoteRender.bind( this ),
			'remote:render': this.onModelRemoteRender.bind( this )
		} );

		if ( 'remote' === this.getTemplateType() && ! this.getEditModel().getHtmlCache() ) {
			editModel.renderRemoteServer();
		}

		if ( elementor.config.contextMenuEnabled ) {
			this.initContextMenu();
		}

		var onRenderMethod = this.onRender;

		this.render = _.throttle( this.render, 300 );

		this.onRender = function() {
			_.defer( onRenderMethod.bind( this ) );
		};
	},

	initContextMenu: function() {
		var contextMenuActions = [
			{
				name: 'edit',
				title: elementor.translate( 'edit' ),
				callback: this.edit.bind( this )
			}, {
				name: 'duplicate',
				title: elementor.translate( 'duplicate' ),
				shortcut: '⌘+D',
				callback: this.duplicate.bind( this )
			}, {
				name: 'copyStyle',
				title: elementor.translate( 'copy_style' ),
				callback: this.copyStyle.bind( this )
			}, {
				name: 'pasteStyle',
				title: elementor.translate( 'paste_style' ),
				callback: this.pasteStyle.bind( this )
			}, {
				name: '__divider__'
			}, {
				name: 'save',
				title: elementor.translate( 'save_as_global' )
			}, {
				name: '__divider__'
			}, {
				name: 'delete',
				title: elementor.translate( 'delete' ),
				shortcut: 'del',
				callback: this.removeElement.bind( this )
			}
		];

		contextMenuActions = elementor.hooks.applyFilters( 'elements/widget/contextMenuActions', contextMenuActions, this );

		this.contextMenu = new ContextMenu( {
			actions: contextMenuActions
		} );
	},

	render: function() {
		if ( this.model.isRemoteRequestActive() ) {
			this.handleEmptyWidget();

			this.$el.addClass( 'elementor-element' );

			return;
		}

		Marionette.CompositeView.prototype.render.apply( this, arguments );
	},

	handleEmptyWidget: function() {
		// TODO: REMOVE THIS !!
		// TEMP CODING !!
		this.$el
			.addClass( 'elementor-widget-empty' )
			.append( '<i class="elementor-widget-empty-icon ' + this.getEditModel().getIcon() + '"></i>' );
	},

	getTemplateType: function() {
		if ( null === this._templateType ) {
			var editModel = this.getEditModel(),
				$template = jQuery( '#tmpl-elementor-' + editModel.get( 'elType' ) + '-' + editModel.get( 'widgetType' ) + '-content' );

			this._templateType = $template.length ? 'js' : 'remote';
		}

		return this._templateType;
	},

	getHTMLContent: function( html ) {
		var htmlCache = this.getEditModel().getHtmlCache();

		return htmlCache || html;
	},

	attachElContent: function( html ) {
		var self = this,
			htmlContent = self.getHTMLContent( html );

		_.defer( function() {
			elementorFrontend.getElements( 'window' ).jQuery( self.el ).html( htmlContent );

			self.bindUIElements(); // Build again the UI elements since the content attached just now
		} );

		return this;
	},

	addInlineEditingAttributes: function( key, toolbar ) {
		this.addRenderAttribute( key, {
			'class': 'elementor-inline-editing',
			'data-elementor-setting-key': key
		} );

		if ( toolbar ) {
			this.addRenderAttribute( key, {
				'data-elementor-inline-editing-toolbar': toolbar
			} );
		}
	},

	getRepeaterSettingKey: function( settingKey, repeaterKey, repeaterItemIndex ) {
		return [ repeaterKey, repeaterItemIndex, settingKey ].join( '.' );
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

	onContextMenu: function( event ) {
		var activeMode = elementor.channels.dataEditMode.request( 'activeMode' );

		if ( 'edit' !== activeMode ) {
			return;
		}

		event.preventDefault();

		this.contextMenu.show( event );
	},

	onRender: function() {
        var self = this;

		BaseElementView.prototype.onRender.apply( self, arguments );

	    var editModel = self.getEditModel(),
	        skinType = editModel.getSetting( '_skin' ) || 'default';

        self.$el
	        .attr( 'data-element_type', editModel.get( 'widgetType' ) + '.' + skinType )
            .removeClass( 'elementor-widget-empty' )
            .children( '.elementor-widget-empty-icon' )
            .remove();

		// TODO: Find better way to detect if all images are loaded
		self.$el.imagesLoaded().always( function() {
			setTimeout( function() {
				if ( 1 > self.$el.height() ) {
					self.handleEmptyWidget();
				}
			}, 200 );
			// Is element empty?
		} );
	},

	onDestroy: function() {
		BaseElementView.prototype.onDestroy.apply( this, arguments );

		this.contextMenu.destroy();
	}
} );

module.exports = WidgetView;
