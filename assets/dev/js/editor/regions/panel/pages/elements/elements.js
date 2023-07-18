var PanelElementsCategoriesCollection = require( './collections/categories' ),
	PanelElementsElementsCollection = require( './collections/elements' ),
	PanelElementsCategoriesView = require( './views/categories' ),
	PanelElementsElementsView = elementor.modules.layouts.panel.pages.elements.views.Elements,
	PanelElementsSearchView = require( './views/search' ),
	PanelElementsGlobalView = require( './views/global' ),
	PanelElementsLayoutView;

PanelElementsLayoutView = Marionette.LayoutView.extend( {
	template: '#tmpl-elementor-panel-elements',

	id: 'elementor-panel-page-elements',

	options: {
		autoFocusSearch: true,
	},

	regions: {
		elements: '#elementor-panel-elements-wrapper',
		search: '#elementor-panel-elements-search-area',
		notice: '#elementor-panel-elements-notice-area',
	},

	regionViews: {},

	elementsCollection: null,

	categoriesCollection: null,

	initialize() {
		this.listenTo( elementor.channels.panelElements, 'element:selected', this.destroy );

		this.initElementsCollection();

		this.initCategoriesCollection();

		this.initRegionViews();
	},

	initRegionViews() {
		var regionViews = {
			elements: {
				region: this.elements,
				view: PanelElementsElementsView,
				options: { collection: this.elementsCollection },
			},
			categories: {
				region: this.elements,
				view: PanelElementsCategoriesView,
				options: { collection: this.categoriesCollection },
			},
			search: {
				region: this.search,
				view: PanelElementsSearchView,
			},
			global: {
				region: this.elements,
				view: PanelElementsGlobalView,
			},
		};

		this.regionViews = elementor.hooks.applyFilters( 'panel/elements/regionViews', regionViews, {
			notice: this.notice,
			elements: this.elements,
			search: this.search,
		} );
},

	initElementsCollection() {
		const elementsCollection = new PanelElementsElementsCollection(),
			isContainerActive = elementorCommon.config.experimentalFeatures.container;

		// Deprecated widget handling.
		Object.entries( elementor.widgetsCache ).forEach( ( [ widgetName, widgetData ] ) => {
			if ( widgetData.deprecation && elementor.widgetsCache[ widgetData.deprecation.replacement ] ) {
				// Hide the old version.
				elementor.widgetsCache[ widgetName ].show_in_panel = false;
			}
		} );

		// TODO: Change the array from server syntax, and no need each loop for initialize
		_.each( elementor.widgetsCache, function( widget ) {
			if ( elementor.config.document.panel.widgets_settings[ widget.widget_type ] ) {
				widget = _.extend( widget, elementor.config.document.panel.widgets_settings[ widget.widget_type ] );
			}

			if ( ! widget.show_in_panel ) {
				return;
			}

			// Don't register the `Inner Section` if the Container experiment is enabled.
			if ( 'inner-section' === widget.name && isContainerActive ) {
				return;
			}

			elementsCollection.add( {
				title: widget.title,
				elType: widget.elType,
				categories: widget.categories,
				keywords: widget.keywords,
				icon: widget.icon,
				widgetType: widget.widget_type,
				custom: widget.custom,
				editable: widget.editable,
				hideOnSearch: widget.hide_on_search,
			} );
		} );

		jQuery.each( elementor.config.promotionWidgets, ( index, widget ) => {
			elementsCollection.add( {
				name: widget.name,
				title: widget.title,
				icon: widget.icon,
				categories: JSON.parse( widget.categories ),
				editable: false,
			} );
		} );

		this.elementsCollection = elementsCollection;
	},

	initCategoriesCollection() {
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
				sort: categoryConfig.sort,
				hideIfEmpty: undefined !== categoryConfig.hideIfEmpty
					? categoryConfig.hideIfEmpty
					: true,
				items: categories[ categoryName ],
			} );
		} );

		this.categoriesCollection = categoriesCollection;
	},

	showView( viewName ) {
		var viewDetails = this.regionViews[ viewName ],
			options = viewDetails.options || {};

		viewDetails.region.show( new viewDetails.view( options ) );
	},

	clearSearchInput() {
		this.getChildView( 'search' ).clearInput();
	},

	changeFilter( filterValue ) {
		elementor.channels.panelElements
			.reply( 'filter:value', filterValue )
			.trigger( 'filter:change' );
	},

	clearFilters() {
		this.changeFilter( null );
		this.clearSearchInput();
	},

	focusSearch() {
		if ( ! elementor.userCan( 'design' ) || ! this.search /* Default panel is not elements */ || ! this.search.currentView /* On global elements empty */ ) {
			return;
		}

		this.search.currentView.ui.input.focus();
	},

	onChildviewChildrenRender() {
		elementor.getPanelView().updateScrollbar();
	},

	onChildviewSearchChangeInput( child ) {
		this.changeFilter( child.ui.input.val(), 'search' );
	},

	onDestroy() {
		elementor.channels.panelElements.reply( 'filter:value', null );
	},

	onShow() {
		this.showView( 'search' );

		if ( this.options.autoFocusSearch ) {
			setTimeout( this.focusSearch.bind( this ) );
		}
	},
} );

module.exports = PanelElementsLayoutView;
