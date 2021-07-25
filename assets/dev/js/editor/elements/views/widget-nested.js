const WidgetView = require( 'elementor-elements/views/widget' ),
	BaseElementView = require( 'elementor-elements/views/base' ),
	ColumnEmptyView = require( 'elementor-elements/views/column-empty' );

const WidgetNestedView = WidgetView.extend( {
	childViewContainer: '.e-widget-children',

	behaviors() {
		var behaviors = WidgetView.prototype.behaviors.apply( this, arguments );

		_.extend( behaviors, {
			Sortable: {
				behaviorClass: require( 'elementor-behaviors/sortable' ),
				elChildType: 'widget',
			},
		} );

		return elementor.hooks.applyFilters( 'elements/widget/behaviors', behaviors, this );
	},

	initialize() {
		console.log( 'asd init' );
		WidgetView.prototype.initialize.apply( this, arguments );

		this.collection.on( 'add remove reset', () => this.setEmptyState() );
	},

	attachElContent( html ) {
		return BaseElementView.prototype.initialize.apply( this, arguments );
	},

	setEmptyState() {
		const isEmpty = this.collection.isEmpty(),
			$dropArea = this.$el.find( '.e-widget-children' );

		if ( ! $dropArea.length ) {
			return;
		}

		const $emptyView = $dropArea.find( '.elementor-empty-view' );

		if ( isEmpty ) {
			if ( $emptyView.length ) {
				return;
			}

			const view = new ColumnEmptyView();
			view.render();

			$dropArea.append( view.$el );
			$dropArea.addClass( 'e-widget-children-empty' );
		} else {
			$emptyView.remove();
			$dropArea.removeClass( 'e-widget-children-empty' );
		}
	},

	getSortableOptions() {
		return {
			connectWith: '.elementor-widget-wrap, .e-container, .e-widget-children',
			items: '.e-widget-children > .elementor-element',
		};
	},

	onRender() {
		WidgetView.prototype.onRender.apply( self, arguments );

		const $dropArea = self.$el.find( '.e-widget-children' );

		if ( ! $dropArea.length ) {
			return;
		}

		this.setEmptyState();

		$dropArea.html5Droppable( {
			axis: [ 'vertical' ],
			items: '> .elementor-element, > .elementor-empty-view > .elementor-first-add',
			groups: [ 'elementor-element' ],
			isDroppingAllowed: true,
			currentElementClass: 'elementor-html5dnd-current-element',
			placeholderClass: 'elementor-sortable-placeholder elementor-widget-placeholder',
			hasDraggingOnChildClass: 'elementor-dragging-on-child',
			onDropping: ( side, event ) => {
				event.stopPropagation();

				// const newIndex = Array.from( parent.children ).indexOf( newElement );
				let newIndex = jQuery( event.currentTarget ).index();

				if ( 'bottom' === side ) {
					newIndex++;
				}

				this.addElementFromPanel( { at: newIndex } );
			},
		} );
	},

} );

module.exports = WidgetNestedView;
