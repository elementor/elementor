import WidgetDraggable from './behaviors/widget-draggable';
import WidgetResizable from './behaviors/widget-resizeable';
import BaseWidget from './base-widget';

const BaseElementView = require( 'elementor-elements/views/base' );

const WidgetView = BaseWidget.extend( {
	_templateType: null,

	toggleEditTools: true,

	events: function() {
		var events = BaseWidget.prototype.events.apply( this, arguments );

		events.click = 'onClickEdit';

		return events;
	},

	behaviors: function() {
		var behaviors = BaseWidget.prototype.behaviors.apply( this, arguments );

		_.extend( behaviors, {
			InlineEditing: {
				behaviorClass: require( 'elementor-behaviors/inline-editing' ),
				inlineEditingClass: 'elementor-inline-editing',
			},
			Draggable: {
				behaviorClass: WidgetDraggable,
			},
			Resizable: {
				behaviorClass: WidgetResizable,
			},
		} );

		return elementor.hooks.applyFilters( 'elements/widget/behaviors', behaviors, this );
	},

	getContextMenuGroups: function() {
		var groups = BaseWidget.prototype.getContextMenuGroups.apply( this, arguments ),
			transferGroupIndex = groups.indexOf( _.findWhere( groups, { name: 'clipboard' } ) );

		groups.splice( transferGroupIndex + 1, 0, {
			name: 'save',
			actions: [
				{
					name: 'save',
					title: __( 'Save as a Global', 'elementor' ),
					shortcut: jQuery( '<i>', { class: 'eicon-pro-icon' } ),
					isEnabled: () => 'global' !== this.options.model.get( 'widgetType' ) &&
						! elementor.selection.isMultiple(),
				},
			],
		} );

		return groups;
	},

	render: function() {
		if ( this.model.isRemoteRequestActive() ) {
			this.handleEmptyWidget();

			this.$el.addClass( 'elementor-element' );

			return;
		}

		if ( this.isDestroyed ) {
			return;
		}

		BaseElementView.prototype.render.apply( this, arguments );
	},

	handleEmptyWidget: function() {
		this.$el
			.addClass( 'elementor-widget-empty' )
			.append( '<i class="elementor-widget-empty-icon ' + this.getEditModel().getIcon() + '"></i>' );
	},

	getTemplateType: function() {
		if ( null === this._templateType ) {
			var editModel = this.getEditModel(),
				$template = jQuery( '#tmpl-elementor-' + editModel.get( 'widgetType' ) + '-content' );

			this._templateType = $template.length ? 'js' : 'remote';
		}

		return this._templateType;
	},

	getHTMLContent: function( html ) {
		var htmlCache = this.getEditModel().getHtmlCache();

		return htmlCache || html;
	},

	attachElContent: function( html ) {
		_.defer( () => {
			elementorFrontend.elements.window.jQuery( this.el ).empty().append( this.getHandlesOverlay(), this.getHTMLContent( html ) );

			this.bindUIElements(); // Build again the UI elements since the content attached just now
		} );

		return this;
	},

	addInlineEditingAttributes: function( key, toolbar ) {
		this.addRenderAttribute( key, {
			class: 'elementor-inline-editing',
			'data-elementor-setting-key': key,
		} );

		if ( toolbar ) {
			this.addRenderAttribute( key, {
				'data-elementor-inline-editing-toolbar': toolbar,
			} );
		}
	},

	onRender: function() {
		var self = this;

		BaseWidget.prototype.onRender.apply( self, arguments );

		var editModel = self.getEditModel(),
			skinType = editModel.getSetting( '_skin' ) || 'default';

		self.$el
			.attr( 'data-widget_type', editModel.get( 'widgetType' ) + '.' + skinType )
			.removeClass( 'elementor-widget-empty' )
			.children( '.elementor-widget-empty-icon' )
			.remove();

		// TODO: Find a better way to detect if all the images have been loaded
		self.$el.imagesLoaded().always( function() {
			setTimeout( function() {
				// Since 'outerHeight' will not handle hidden elements, and mark them as empty (e.g. nested tabs).
				const $widgetContainer = self.$el.children( '.elementor-widget-container' ),
					shouldHandleEmptyWidget = $widgetContainer.is( ':visible' ) && ! $widgetContainer.outerHeight();

				if ( shouldHandleEmptyWidget ) {
					self.handleEmptyWidget();
				}
			}, 200 );
			// Is element empty?
		} );
	},

	onClickEdit: function( event ) {
		if ( this.container?.isEditable() ) {
			this.onEditButtonClick( event );
		}
	},
} );

module.exports = WidgetView;
