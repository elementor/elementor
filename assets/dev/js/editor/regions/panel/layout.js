var EditModeItemView = require( 'elementor-regions/panel/edit-mode' ),
	PanelLayoutView;

import PanelComponent from './component';
import ElementsComponent from './pages/elements/component';
import EditorComponent from './pages/editor/component';

PanelLayoutView = Marionette.LayoutView.extend( {
	template: '#tmpl-elementor-panel',

	id: 'elementor-panel-inner',

	regions: {
		content: '#elementor-panel-content-wrapper',
		header: '#elementor-panel-header-wrapper',
		footer: '#elementor-panel-footer',
		modeSwitcher: '#elementor-mode-switcher',
	},

	pages: {},

	childEvents: {
		'click:add'() {
			$e.route( 'panel/elements/categories' );
		},
		'editor:destroy'() {
			$e.route( 'panel/elements/categories', {
				autoFocusSearch: false,
			} );
		},
	},

	currentPageName: null,

	currentPageView: null,

	perfectScrollbar: null,

	initialize() {
		$e.components.register( new PanelComponent( { manager: this } ) );

		$e.internal( 'panel/state-loading' );

		$e.components.register( new ElementsComponent( { manager: this } ) );

		$e.components.register( new EditorComponent( { manager: this } ) );

		this.initPages();
	},

	buildPages() {
		var pages = {
			elements: {
				view: require( 'elementor-panel/pages/elements/elements' ),
				title: '<img src="' + elementorCommon.config.urls.assets + 'images/logo-panel.svg">',
			},
			editor: {
				view: require( 'elementor-panel/pages/editor' ),
			},
			menu: {
				view: elementor.modules.layouts.panel.pages.menu.Menu,
				title: '<img src="' + elementorCommon.config.urls.assets + 'images/logo-panel.svg">',
			},
		};

		return pages;
	},

	initPages() {
		var pages;

		this.getPages = function( page ) {
			if ( ! pages ) {
				pages = this.buildPages();
			}

			return page ? pages[ page ] : pages;
		};

		this.addPage = function( pageName, pageData ) {
			if ( ! pages ) {
				pages = this.buildPages();
			}

			pages[ pageName ] = pageData;
		};
	},

	getHeaderView() {
		return this.getChildView( 'header' );
	},

	getFooterView() {
		return this.getChildView( 'footer' );
	},

	getCurrentPageName() {
		return this.currentPageName;
	},

	getCurrentPageView() {
		return this.currentPageView;
	},

	setPage( page, title, viewOptions ) {
		const pages = this.getPages();

		if ( 'elements' === page && ! elementor.userCan( 'design' ) ) {
			if ( pages.page_settings ) {
				page = 'page_settings';
			}
		}

		const pageData = pages[ page ];

		if ( ! pageData ) {
			throw new ReferenceError( 'Elementor panel doesn\'t have page named \'' + page + '\'' );
		}

		if ( pageData.options ) {
			viewOptions = _.extend( pageData.options, viewOptions );
		}

		let View = pageData.view;

		if ( pageData.getView ) {
			View = pageData.getView();
		}

		this.currentPageName = page;

		this.currentPageView = new View( viewOptions );

		this.showChildView( 'content', this.currentPageView );

		this.getHeaderView().setTitle( title || pageData.title );

		this
			.trigger( 'set:page', this.currentPageView )
			.trigger( 'set:page:' + page, this.currentPageView );

		if ( elementor.promotion.dialog ) {
			elementor.promotion.dialog.hide();
		}

		return this.currentPageView;
	},

	onBeforeShow() {
		var PanelFooterItemView = require( 'elementor-regions/panel/footer' ),
			PanelHeaderItemView = require( 'elementor-regions/panel/header' );

		// Edit Mode
		this.showChildView( 'modeSwitcher', new EditModeItemView() );

		// Header
		this.showChildView( 'header', new PanelHeaderItemView() );

		// Footer
		this.showChildView( 'footer', new PanelFooterItemView() );

		// Added Editor events
		this.updateScrollbar = _.throttle( this.updateScrollbar, 100 );

		this.getRegion( 'content' )
			.on( 'before:show', this.onEditorBeforeShow.bind( this ) )
			.on( 'empty', this.onEditorEmpty.bind( this ) )
			.on( 'show', this.updateScrollbar.bind( this ) );
	},

	onEditorBeforeShow() {
		_.defer( this.updateScrollbar.bind( this ) );
	},

	onEditorEmpty() {
		this.updateScrollbar();
	},

	updateScrollbar() {
		if ( ! this.perfectScrollbar ) {
			this.perfectScrollbar = new PerfectScrollbar( this.content.el, {
				suppressScrollX: true,
			} );

			// The RTL is buggy, so always keep it LTR.
			this.perfectScrollbar.isRtl = false;

			return;
		}

		this.perfectScrollbar.update();
	},
} );

module.exports = PanelLayoutView;
