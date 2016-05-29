var ElementsCollection = require( './collections/elements' ),
	PanelElementsElementsView = require( './views/elements' ),
	PanelElementsSearchView = require( './views/search' ),
	PanelElementsLayoutView;

PanelElementsLayoutView = Marionette.LayoutView.extend( {
	template: '#tmpl-elementor-panel-elements',

	regions: {
		elements: '#elementor-panel-elements-wrapper',
		search: '#elementor-panel-elements-search-area'
	},

	initialize: function() {
		this.listenTo( elementor.panelElements, 'element:selected', this.destroy );
	},

	clearSearchInput: function() {
		this.getChildView( 'search' ).triggerMethod( 'clear:filter' );
	},

	changeFilter: function( filterValue ) {
		elementor.panelElements
			.reply( 'filter:value', filterValue )
			.trigger( 'change' );
	},

	clearFilters: function() {
		this.changeFilter( null );
		this.clearSearchInput();
	},

	onChildviewDragStart: function( childView ) {
		elementor.panelElements.reply( 'element:selected', childView );
	},

	onChildviewChildrenRender: function() {
		this.updateElementsScrollbar();
	},

	onChildviewSearchChangeInput: function( child ) {
		var value = child.ui.input.val();

		this.changeFilter( value, 'search' );
	},

	onDestroy: function() {
		elementor.panelElements.reply( 'filter:value', null );
	},

	onShow: function() {
		var elementsRegion = this.getRegion( 'elements' ),
			searchRegion = this.getRegion( 'search' );

		var elements = new ElementsCollection();

		// Add a section to the collection
		var sectionConfig = elementor.config.elements.section;

		elements.add( {
			title: elementor.translate( 'inner_section' ),
			elType: 'section',
			keywords: sectionConfig.keywords,
			icon: sectionConfig.icon
		} );

		// TODO: Change the array from server syntax, and no need each loop for initialize
		_.each( elementor.config.widgets, function( element, widgetType ) {
			elements.add( {
				title: element.title,
				elType: 'widget',
				categories: element.categories,
				keywords: element.keywords,
				icon: element.icon,
				widgetType: widgetType
			} );
		} );

		elementsRegion.show( new PanelElementsElementsView( { collection: elements } ) );
		searchRegion.show( new PanelElementsSearchView() );
	},

	updateElementsScrollbar: function() {
		elementor.data.trigger( 'scrollbar:update' );
	}
} );

module.exports = PanelElementsLayoutView;
