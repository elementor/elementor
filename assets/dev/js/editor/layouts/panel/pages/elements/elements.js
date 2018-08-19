var PanelElementsCategoriesCollection = require( './collections/categories' ),
	PanelElementsElementsCollection = require( './collections/elements' ),
	PanelElementsCategoriesView = require( './views/categories' ),
	PanelElementsElementsView = elementor.modules.layouts.panel.pages.elements.views.Elements,
	PanelElementsSearchView = require( './views/search' ),
	PanelElementsGlobalView = require( './views/global' ),
	PanelElementsLayoutView;

PanelElementsLayoutView = Marionette.LayoutView.extend( {
	template: '#tmpl-elementor-panel-elements',

	options: {
		autoFocusSearch: true
	},

	regions: {
		elements: '#elementor-panel-elements-wrapper',
		search: '#elementor-panel-elements-search-area'
	},

	ui: {
		tabs: '.elementor-panel-navigation-tab'
	},

	events: {
		'click @ui.tabs': 'onTabClick'
	},

	regionViews: {},

	elementsCollection: null,

	categoriesCollection: null,

	initialize: function() {
		this.listenTo( elementor.channels.panelElements, 'element:selected', this.destroy );

		this.initElementsCollection();

		this.initCategoriesCollection();

		this.initRegionViews();
	},

	initRegionViews: function() {
		var regionViews = {
			elements: {
				region: this.elements,
				view: PanelElementsElementsView,
				options: { collection: this.elementsCollection }
			},
			categories: {
				region: this.elements,
				view: PanelElementsCategoriesView,
				options: { collection: this.categoriesCollection }
			},
			search: {
				region: this.search,
				view: PanelElementsSearchView
			},
			global: {
				region: this.elements,
				view: PanelElementsGlobalView
			}
		};

		this.regionViews = elementor.hooks.applyFilters( 'panel/elements/regionViews', regionViews );
	},

	initElementsCollection: function() {
		var elementsCollection = new PanelElementsElementsCollection(),
			sectionConfig = elementor.config.elements.section;

		elementsCollection.add( {
			title: elementor.translate( 'inner_section' ),
			elType: 'section',
			categories: [ 'basic' ],
			icon: sectionConfig.icon
		} );

		// TODO: Change the array from server syntax, and no need each loop for initialize
		_.each( elementor.config.widgets, function( widget ) {
			if ( ! widget.show_in_panel ) {
				return;
			}

			elementsCollection.add( {
				title: widget.title,
				elType: widget.elType,
				categories: widget.categories,
				keywords: widget.keywords,
				icon: widget.icon,
				widgetType: widget.widget_type,
				custom: widget.custom
			} );
		} );

		this.elementsCollection = elementsCollection;
	},

	initCategoriesCollection: function() {
		var categories = {};

		this.elementsCollection.each( function( element ) {
			_.each( element.get( 'categories' ), function( category ) {
				if ( ! categories[ category ] ) {
					categories[ category ] = [];
				}

				categories[ category ].push( element );
			} );
		} );

		var categoriesCollection = new PanelElementsCategoriesCollection();

		_.each( elementor.config.document.panel.elements_categories, function( categoryConfig, categoryName ) {
			if ( ! categories[ categoryName ] ) {
				return;
			}

			// Set defaults.
			if ( 'undefined' === typeof categoryConfig.active ) {
				categoryConfig.active = true;
			}

			if ( 'undefined' === typeof categoryConfig.icon ) {
				categoryConfig.icon = 'font';
			}

			categoriesCollection.add( {
				name: categoryName,
				title: categoryConfig.title,
				icon: categoryConfig.icon,
				defaultActive: categoryConfig.active,
				items: categories[ categoryName ]
			} );
		} );

		this.categoriesCollection = categoriesCollection;
	},

	activateTab: function( tabName ) {
		this.ui.tabs
			.removeClass( 'elementor-active' )
			.filter( '[data-view="' + tabName + '"]' )
			.addClass( 'elementor-active' );

		this.showView( tabName );
	},

	showView: function( viewName ) {
		var viewDetails = this.regionViews[ viewName ],
			options = viewDetails.options || {};

		viewDetails.region.show( new viewDetails.view( options ) );
	},

	clearSearchInput: function() {
		this.getChildView( 'search' ).clearInput();
	},

	changeFilter: function( filterValue ) {
		elementor.channels.panelElements
			.reply( 'filter:value', filterValue )
			.trigger( 'filter:change' );
	},

	clearFilters: function() {
		this.changeFilter( null );
		this.clearSearchInput();
	},

	focusSearch: function() {
		this.search.currentView.ui.input.focus();
	},

	onChildviewChildrenRender: function() {
		elementor.getPanelView().updateScrollbar();
	},

	onChildviewSearchChangeInput: function( child ) {
		this.changeFilter( child.ui.input.val(), 'search' );
	},

	onDestroy: function() {
		elementor.channels.panelElements.reply( 'filter:value', null );
	},

	onShow: function() {
		this.showView( 'categories' );

		this.showView( 'search' );

		if ( this.options.autoFocusSearch ) {
			setTimeout( this.focusSearch.bind( this ) );
		}
	},

	onTabClick: function( event ) {
		this.activateTab( event.currentTarget.dataset.view );
	}
} );

module.exports = PanelElementsLayoutView;
