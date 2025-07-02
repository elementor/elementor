var BaseContainer = require( 'elementor-views/base-container' ),
	BaseSectionsContainerView,
	{ ELEMENT_TYPES, getAllElementTypes } = require( 'elementor-editor/utils/element-types' );

BaseSectionsContainerView = BaseContainer.extend( {
	getChildView( model ) {
		const type = elementor.elementsManager.getElementTypeClass( model.get( 'elType' ) );

		if ( ! type ) {
			throw new Error( `Element type "${ type }" is not registered.` );
		}

		return type.getView();
	},

	behaviors() {
		var behaviors = {
			// Sortable: {
			// 	behaviorClass: require( 'elementor-behaviors/sortable' ),
			// 	elChildType: ELEMENT_TYPES.SECTION,
			// },
		};

		return elementor.hooks.applyFilters( 'elements/base-section-container/behaviors', behaviors, this );
	},

	getSortableOptions() {
		return {
			handle: '> .elementor-element-overlay .elementor-editor-element-edit',
			items: '> .elementor-section, > .e-con',
		};
	},

	getChildType() {
		return getAllElementTypes();
	},

	initialize() {
		BaseContainer.prototype.initialize.apply( this, arguments );

		this.listenTo( elementor.channels.panelElements, 'element:drag:start', this.onPanelElementDragStart )
			.listenTo( elementor.channels.panelElements, 'element:drag:end', this.onPanelElementDragEnd );
	},

	onPanelElementDragStart() {
		// A temporary workaround in order to fix Chrome's 70+ dragging above nested iframe bug
		this.$el.find( '.elementor-background-video-embed' ).hide();

		elementor.helpers.disableElementEvents( this.$el.find( 'iframe' ) );
	},

	onPanelElementDragEnd() {
		this.$el.find( '.elementor-background-video-embed' ).show();

		elementor.helpers.enableElementEvents( this.$el.find( 'iframe' ) );
	},
} );

module.exports = BaseSectionsContainerView;
