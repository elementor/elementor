var SectionView = require( 'elementor-views/section' ),
	BaseSectionsContainerView;

BaseSectionsContainerView = Marionette.CompositeView.extend( {
	childView: SectionView,

	behaviors: {
		Sortable: {
			behaviorClass: require( 'elementor-behaviors/sortable' ),
			elChildType: 'section'
		},
		HandleDuplicate: {
			behaviorClass: require( 'elementor-behaviors/handle-duplicate' )
		},
		HandleAdd: {
			behaviorClass: require( 'elementor-behaviors/duplicate' )
		}
	},

	getSortableOptions: function() {
		return {
			handle: '> .elementor-element-overlay .elementor-editor-section-settings .elementor-editor-element-trigger',
			items: '> .elementor-section'
		};
	},

	getChildType: function() {
		return [ 'section' ];
	},

	isCollectionFilled: function() {
		return false;
	},

	initialize: function() {
		this
			.listenTo( this.collection, 'add remove reset', this.onCollectionChanged )
			.listenTo( elementor.channels.panelElements, 'element:drag:start', this.onPanelElementDragStart )
			.listenTo( elementor.channels.panelElements, 'element:drag:end', this.onPanelElementDragEnd );
	},

	addChildModel: function( model, options ) {
		return this.collection.add( model, options, true );
	},

	addSection: function( properties, options ) {
		var newSection = {
			id: elementor.helpers.getUniqueID(),
			elType: 'section',
			settings: {},
			elements: []
		};

		if ( properties ) {
			_.extend( newSection, properties );
		}

		var newModel = this.addChildModel( newSection, options );

		return this.children.findByModelCid( newModel.cid );
	},

	onCollectionChanged: function() {
		elementor.setFlagEditorChange( true );
	},

	onPanelElementDragStart: function() {
		elementor.helpers.disableElementEvents( this.$el.find( 'iframe' ) );
	},

	onPanelElementDragEnd: function() {
		elementor.helpers.enableElementEvents( this.$el.find( 'iframe' ) );
	}
} );

module.exports = BaseSectionsContainerView;
