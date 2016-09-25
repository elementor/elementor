var BaseElementView = require( 'elementor-views/base-element' ),
	ElementEmptyView = require( 'elementor-views/element-empty' ),
	WidgetView = require( 'elementor-views/widget' ),
	ColumnView;

ColumnView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-element-column-content' ),

	elementEvents: {
		'click > .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-remove': 'onClickRemove',
		'click @ui.listTriggers': 'onClickTrigger'
	},

	getChildView: function( model ) {
		if ( 'section' === model.get( 'elType' ) ) {
			return require( 'elementor-views/section' ); // We need to require the section dynamically
		}

		return WidgetView;
	},

	emptyView: ElementEmptyView,

	className: function() {
		var classes = 'elementor-column',
			type = this.isInner() ? 'inner' : 'top';

		classes += ' elementor-' + type + '-column';

		return classes;
	},

	childViewContainer: '> .elementor-column-wrap > .elementor-widget-wrap',

	triggers: {
		'click > .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-add': 'click:new',
		'click > .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-edit': 'click:edit',
		'click > .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-trigger': 'click:edit',
		'click > .elementor-element-overlay .elementor-editor-column-settings-list .elementor-editor-element-duplicate': 'click:duplicate'
	},

	ui: {
		columnTitle: '.column-title',
		columnInner: '> .elementor-column-wrap',
		listTriggers: '> .elementor-element-overlay .elementor-editor-element-trigger'
	},

	behaviors: {
		Sortable: {
			behaviorClass: require( 'elementor-behaviors/sortable' ),
			elChildType: 'widget'
		},
		Resizable: {
			behaviorClass: require( 'elementor-behaviors/resizable' )
		},
		HandleDuplicate: {
			behaviorClass: require( 'elementor-behaviors/handle-duplicate' )
		},
		HandleEditor: {
			behaviorClass: require( 'elementor-behaviors/handle-editor' )
		},
		HandleEditMode: {
			behaviorClass: require( 'elementor-behaviors/handle-edit-mode' )
		},
		HandleAddMode: {
			behaviorClass: require( 'elementor-behaviors/duplicate' )
		},
		HandleElementsRelation: {
			behaviorClass: require( 'elementor-behaviors/elements-relation' )
		}
	},

	initialize: function() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		this.listenTo( elementor.channels.data, 'widget:drag:start', this.onWidgetDragStart );
		this.listenTo( elementor.channels.data, 'widget:drag:end', this.onWidgetDragEnd );
	},

	isDroppingAllowed: function() {
		var elementView = elementor.channels.panelElements.request( 'element:selected' ),
			elType = elementView.model.get( 'elType' );

		if ( 'section' === elType ) {
			return ! this.isInner();
		}

		return 'widget' === elType;
	},

	changeSizeUI: function() {
		var columnSize = this.model.getSetting( '_column_size' ),
			inlineSize = this.model.getSetting( '_inline_size' ),
			columnSizeTitle = parseFloat( inlineSize || columnSize ).toFixed( 1 ) + '%';

		this.$el.attr( 'data-col', columnSize );

		this.ui.columnTitle.html( columnSizeTitle );
	},

	getSortableOptions: function() {
		return {
			connectWith: '.elementor-widget-wrap',
			items: '> .elementor-element'
		};
	},

	// Events
	onCollectionChanged: function() {
		BaseElementView.prototype.onCollectionChanged.apply( this, arguments );

		this.changeChildContainerClasses();
	},

	changeChildContainerClasses: function() {
		var emptyClass = 'elementor-element-empty',
			populatedClass = 'elementor-element-populated';

		if ( this.collection.isEmpty() ) {
			this.ui.columnInner.removeClass( populatedClass ).addClass( emptyClass );
		} else {
			this.ui.columnInner.removeClass( emptyClass ).addClass( populatedClass );
		}
	},

	onRender: function() {
		var self = this;

		self.changeChildContainerClasses();
		self.changeSizeUI();

		self.$el.html5Droppable( {
			items: ' > .elementor-column-wrap > .elementor-widget-wrap > .elementor-element, >.elementor-column-wrap > .elementor-widget-wrap > .elementor-empty-view > .elementor-first-add',
			axis: [ 'vertical' ],
			groups: [ 'elementor-element' ],
			isDroppingAllowed: _.bind( self.isDroppingAllowed, self ),
			onDragEnter: function() {
				self.$el.addClass( 'elementor-dragging-on-child' );
			},
			onDragging: function( side, event ) {
				event.stopPropagation();

				if ( this.dataset.side !== side ) {
					Backbone.$( this ).attr( 'data-side', side );
				}
			},
			onDragLeave: function() {
				self.$el.removeClass( 'elementor-dragging-on-child' );

				Backbone.$( this ).removeAttr( 'data-side' );
			},
			onDropping: function( side, event ) {
				event.stopPropagation();

				var elementView = elementor.channels.panelElements.request( 'element:selected' ),
					newIndex = Backbone.$( this ).index();

				if ( 'bottom' === side ) {
					newIndex++;
				}

				var itemData = {
					id: elementor.helpers.getUniqueID(),
					elType: elementView.model.get( 'elType' )
				};

				if ( 'widget' === itemData.elType ) {
					itemData.widgetType = elementView.model.get( 'widgetType' );
				} else if ( 'section' === itemData.elType ) {
					itemData.elements = [];
					itemData.isInner = true;
				} else {
					return;
				}

				self.triggerMethod( 'request:add', itemData, { at: newIndex } );
			}
		} );
	},

	onClickTrigger: function( event ) {
		event.preventDefault();

		var $trigger = this.$( event.currentTarget ),
			isTriggerActive = $trigger.hasClass( 'elementor-active' );

		this.ui.listTriggers.removeClass( 'elementor-active' );

		if ( ! isTriggerActive ) {
			$trigger.addClass( 'elementor-active' );
		}
	},

	onWidgetDragStart: function() {
		this.$el.addClass( 'elementor-dragging' );
	},

	onWidgetDragEnd: function() {
		this.$el.removeClass( 'elementor-dragging' );
	}
} );

module.exports = ColumnView;
