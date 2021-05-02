import { DEFAULT_MAX_COLUMNS } from 'elementor-elements/views/section';

var BaseElementView = require( 'elementor-elements/views/base' ),
	ColumnEmptyView = require( 'elementor-elements/views/column-empty' ),
	ColumnView;

ColumnView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-column-content' ),

	emptyView: ColumnEmptyView,

	childViewContainer: elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ] ? '' : '> .elementor-column-wrap > .elementor-widget-wrap',

	toggleEditTools: true,

	behaviors: function() {
		var behaviors = BaseElementView.prototype.behaviors.apply( this, arguments );

		_.extend( behaviors, {
			Sortable: {
				behaviorClass: require( 'elementor-behaviors/sortable' ),
				elChildType: 'widget',
			},
			Resizable: {
				behaviorClass: require( 'elementor-behaviors/column-resizable' ),
			},
		} );

		return elementor.hooks.applyFilters( 'elements/column/behaviors', behaviors, this );
	},

	className: function() {
		var classes = BaseElementView.prototype.className.apply( this, arguments ),
			type = this.isInner() ? 'inner' : 'top';

		// Add an `elementor-widget-wrap`class to the column in order to attach its styles & events to the column,
		// since this element doesn't exist when the DOM experiment is active.
		if ( elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ] ) {
			classes += ' elementor-widget-wrap';
		}

		return classes + ' elementor-column elementor-' + type + '-column';
	},

	tagName: function() {
		return this.model.getSetting( 'html_tag' ) || 'div';
	},

	ui: function() {
		var ui = BaseElementView.prototype.ui.apply( this, arguments );

		ui.columnInner = elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ] ? '' : '> .elementor-column-wrap > .elementor-widget-wrap';

		ui.percentsTooltip = '> .elementor-element-overlay .elementor-column-percents-tooltip';

		return ui;
	},

	getEditButtons: function() {
		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		editTools.edit = {
			/* translators: %s: Element Name. */
			title: sprintf( __( 'Edit %s', 'elementor' ), elementData.title ),
			icon: 'column',
		};

		if ( elementor.getPreferences( 'edit_buttons' ) ) {
			editTools.duplicate = {
				/* translators: %s: Element Name. */
				title: sprintf( __( 'Duplicate %s', 'elementor' ), elementData.title ),
				icon: 'clone',
			};

			editTools.add = {
				/* translators: %s: Element Name. */
				title: sprintf( __( 'Add %s', 'elementor' ), elementData.title ),
				icon: 'plus',
			};

			editTools.remove = {
				/* translators: %s: Element Name. */
				title: sprintf( __( 'Delete %s', 'elementor' ), elementData.title ),
				icon: 'close',
			};
		}

		return editTools;
	},

	initialize: function() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		this.model.get( 'editSettings' ).set( 'defaultEditRoute', 'layout' );
	},

	attachElContent: function() {
		BaseElementView.prototype.attachElContent.apply( this, arguments );

		const $tooltip = jQuery( '<div>', { class: 'elementor-column-percents-tooltip' } );

		this.$el.children( '.elementor-element-overlay' ).append( $tooltip );
	},

	getContextMenuGroups: function() {
		const self = this,
			groups = BaseElementView.prototype.getContextMenuGroups.apply( this, arguments ),
			generalGroupIndex = groups.indexOf( _.findWhere( groups, { name: 'general' } ) );

		groups.splice( generalGroupIndex + 1, 0, {
			name: 'addNew',
			actions: [
				{
					name: 'addNew',
                    icon: 'eicon-plus',
					title: __( 'Add New Column', 'elementor' ),
					callback: this.addNewColumn.bind( this ),
					isEnabled: () => self.model.collection.length < DEFAULT_MAX_COLUMNS,
				},
			],
		} );

		return groups;
	},

	isDroppingAllowed: function() {
		// Don't allow dragging items to document which is not editable.
		if ( ! this.getContainer().isEditable() ) {
			return false;
		}

		var elementView = elementor.channels.panelElements.request( 'element:selected' );

		if ( ! elementView ) {
			return false;
		}

		var elType = elementView.model.get( 'elType' );

		if ( 'section' === elType ) {
			return ! this.isInner();
		}

		return 'widget' === elType;
	},

	getPercentsForDisplay: function() {
		const inlineSize = +this.model.getSetting( '_inline_size' ) || this.getPercentSize();

		return inlineSize.toFixed( 1 ) + '%';
	},

	changeSizeUI: function() {
		const self = this,
			columnSize = self.model.getSetting( '_column_size' );

		self.$el.attr( 'data-col', columnSize );

		_.defer( function() { // Wait for the column size to be applied
			if ( self.ui.percentsTooltip ) {
				self.ui.percentsTooltip.text( self.getPercentsForDisplay() );
			}
		} );
	},

	getPercentSize: function( size ) {
		if ( ! size ) {
			size = this.el.getBoundingClientRect().width;
		}

		return +( size / this.$el.parent().width() * 100 ).toFixed( 3 );
	},

	getSortableOptions: function() {
		const connectWith = elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ] ? this.$el : '.elementor-widget-wrap';

		return {
			connectWith,
			items: '> .elementor-element',
		};
	},

	changeChildContainerClasses: function() {
		const emptyClass = 'elementor-element-empty',
			populatedClass = 'elementor-element-populated',
			columnInner = ( this.ui.columnInner.length ) ? this.ui.columnInner : this.$el;

		if ( columnInner ) {
			if ( this.collection.isEmpty() ) {
				columnInner.removeClass( populatedClass ).addClass( emptyClass );
			} else {
				columnInner.removeClass( emptyClass ).addClass( populatedClass );
			}
		}
	},

	addNewColumn: function() {
		$e.run( 'document/elements/create', {
			model: {
				elType: 'column',
			},
			container: this.getContainer().parent,
			options: {
				at: this.$el.index() + 1,
			},
		} );
	},

	onRender: function() {
		const isDomOptimizationActive = elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ];

		let itemsClasses = '';

		if ( isDomOptimizationActive ) {
			itemsClasses = ' > .elementor-element, > .elementor-empty-view > .elementor-first-add';
		} else {
			itemsClasses = ' > .elementor-column-wrap > .elementor-widget-wrap > .elementor-element, >.elementor-column-wrap > .elementor-widget-wrap > .elementor-empty-view > .elementor-first-add';
		}

		BaseElementView.prototype.onRender.apply( this, arguments );

		this.changeChildContainerClasses();

		this.changeSizeUI();

		this.$el.html5Droppable( {
			items: itemsClasses,
			axis: [ 'vertical' ],
			groups: [ 'elementor-element' ],
			isDroppingAllowed: this.isDroppingAllowed.bind( this ),
			currentElementClass: 'elementor-html5dnd-current-element',
			placeholderClass: 'elementor-sortable-placeholder elementor-widget-placeholder',
			hasDraggingOnChildClass: 'elementor-dragging-on-child',
			onDropping: ( side, event ) => {
				event.stopPropagation();

				// Triggering drag end manually, since it won't fired above iframe
				elementor.getPreviewView().onPanelElementDragEnd();

				const widgets = Object.values( this.$el.find( '> .elementor-element' ) );
				let newIndex = widgets.indexOf( event.currentTarget );

				if ( 'bottom' === side ) {
					newIndex++;
				} else if ( 'top' === side ) {
					newIndex--;
				}

				if ( 0 > newIndex ) {
					newIndex = 0;
				}

				this.addElementFromPanel( { at: newIndex } );
			},
		} );
	},

	// Move the resize handle to prevent UI breaking when DOM optimization is active.
	moveResizeHandle: function() {
		const isDomOptimizationActive = elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ];

		// TODO: Find a better solution.
		if ( isDomOptimizationActive ) {
			const resizeHandle = this.$el.find( '> .ui-resizable-handle' );
			if ( resizeHandle.length > 0 ) {
				this.$el.prepend( resizeHandle );
			}
		}
	},

	onAddButtonClick: function( event ) {
		event.stopPropagation();

		this.addNewColumn();
	},
} );

module.exports = ColumnView;
