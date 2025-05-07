var TemplateLibraryHeaderActionsView = require( 'elementor-templates/views/parts/header-parts/actions' ),
	TemplateLibraryHeaderMenuView = require( 'elementor-templates/views/parts/header-parts/menu' ),
	TemplateLibraryHeaderPreviewView = require( 'elementor-templates/views/parts/header-parts/preview' ),
	TemplateLibraryHeaderBackView = require( 'elementor-templates/views/parts/header-parts/back' ),
	TemplateLibraryCollectionView = require( 'elementor-templates/views/parts/templates' ),
	TemplateLibrarySaveTemplateView = require( 'elementor-templates/views/parts/save-template' ),
	TemplateLibraryImportView = require( 'elementor-templates/views/parts/import' ),
	TemplateLibraryConnectView = require( 'elementor-templates/views/parts/connect' ),
	TemplateLibraryCloudStateView = require( 'elementor-templates/views/parts/cloud-states' ),
	TemplateLibraryPreviewView = require( 'elementor-templates/views/parts/preview' ),
	TemplateLibraryNavigationContainerView = require( 'elementor-templates/views/parts/navigation-container' );

import { SAVE_CONTEXTS } from './../constants';

module.exports = elementorModules.common.views.modal.Layout.extend( {
	getModalOptions() {
		const allowClosingModal = window?.elementor?.config?.document?.panel?.allow_closing_remote_library ?? true;

		return {
			id: 'elementor-template-library-modal',
			hide: {
				onOutsideClick: allowClosingModal,
				onBackgroundClick: allowClosingModal,
				onEscKeyPress: allowClosingModal,
				ignore: '.dialog-widget-content, .dialog-buttons-undo_bulk_delete, .dialog-buttons-template_after_save, #elementor-library--infotip__dialog, #elementor-template-library-rename-dialog, #elementor-template-library-delete-dialog',
			},
		};
	},

	getLogoOptions() {
		return {
			title: __( 'Library', 'elementor' ),
			click() {
				$e.run( 'library/open', { toDefault: true } );
			},
		};
	},

	getTemplateActionButton( templateData ) {
		const subscriptionPlans = elementor.config.library_connect.subscription_plans,
			baseAccessTier = elementor.config.library_connect.base_access_tier,
			templateAccessTier = templateData.accessTier,
			shouldUpgrade = baseAccessTier !== templateAccessTier;

		let viewId = '#tmpl-elementor-template-library-' + ( shouldUpgrade ? 'upgrade-plan-button' : 'insert-button' );

		viewId = elementor.hooks.applyFilters( 'elementor/editor/template-library/template/action-button', viewId, templateData );

		const template = Marionette.TemplateCache.get( viewId );
		const subscriptionPlan = subscriptionPlans[ templateAccessTier ];
		const promotionText = elementorAppConfig.hasPro ? 'Upgrade' : `Go ${ subscriptionPlan.label }`;

		try {
			const promotionUrlPieces = new URL( subscriptionPlan.promotion_url );
			const queryString = promotionUrlPieces.searchParams.toString();

			const promotionLinkQueryString = elementor.hooks.applyFilters(
				'elementor/editor/template-library/template/promotion-link-search-params',
				queryString,
				templateData,
			);

			return Marionette.Renderer.render( template, {
				promotionText,
				promotionLink: `${ promotionUrlPieces.origin }${ promotionUrlPieces.pathname }?${ promotionLinkQueryString }`,
			} );
		} catch ( e ) {
			return Marionette.Renderer.render( template, {
				promotionText,
				promotionLink: subscriptionPlan.promotion_url,
			} );
		}
	},

	setHeaderDefaultParts() {
		var headerView = this.getHeaderView();

		headerView.tools.show( new TemplateLibraryHeaderActionsView() );
		headerView.menuArea.show( new TemplateLibraryHeaderMenuView() );

		this.showLogo();
	},

	showTemplatesView( templatesCollection ) {
		this.modalContent.show( new TemplateLibraryCollectionView( {
			collection: templatesCollection,
		} ) );
	},

	updateViewCollection( models ) {
		this.modalContent.currentView.collection.reset( models );
		this.modalContent.currentView.ui.navigationContainer.html( ( new TemplateLibraryNavigationContainerView() ).render()?.el );
	},

	addTemplates( models ) {
		this.modalContent.currentView.collection.add( models, { merge: true } );
	},

	showImportView() {
		const headerView = this.getHeaderView();

		headerView.menuArea.reset();

		this.modalContent.show( new TemplateLibraryImportView() );

		headerView.logoArea.show( new TemplateLibraryHeaderBackView() );
	},

	showConnectView( args ) {
		this.getHeaderView().menuArea.reset();

		this.modalContent.show( new TemplateLibraryConnectView( args ) );
	},

	showCloudStateView() {
		this.modalContent.show( new TemplateLibraryCloudStateView() );
	},

	showSaveTemplateView( elementModel, context = SAVE_CONTEXTS.SAVE ) {
		const headerView = this.getHeaderView();

		headerView.menuArea.reset();

		if ( SAVE_CONTEXTS.SAVE !== context ) {
			headerView.logoArea.show( new TemplateLibraryHeaderBackView() );
		}

		this.modalContent.show( new TemplateLibrarySaveTemplateView( { model: elementModel, context } ) );
	},

	showPreviewView( templateModel ) {
		this.modalContent.show( new TemplateLibraryPreviewView( {
			url: templateModel.get( 'url' ),
		} ) );

		var headerView = this.getHeaderView();

		headerView.menuArea.reset();

		headerView.tools.show( new TemplateLibraryHeaderPreviewView( {
			model: templateModel,
		} ) );

		headerView.logoArea.show( new TemplateLibraryHeaderBackView() );
	},

	async showFolderView( elementModel ) {
		try {
			elementor.templates.layout.showLoadingView();

			await elementor.templates.getFolderTemplates( elementModel );
		} finally {
			elementor.templates.layout.hideLoadingView();
		}
	},

	createScreenshotIframe( previewUrl ) {
		const iframe = document.createElement( 'iframe' );

		iframe.src = previewUrl;
		iframe.width = '1200';
		iframe.height = '500';
		iframe.style = 'visibility: hidden;';

		document.body.appendChild( iframe );

		return iframe;
	},

	handleBulkActionBarUi() {
		if ( 0 === this.modalContent.currentView.$( '.bulk-selection-item-checkbox:checked' ).length ) {
			this.modalContent.currentView.$el.addClass( 'no-bulk-selections' );
			this.modalContent.currentView.$el.removeClass( 'has-bulk-selections' );
		} else {
			this.modalContent.currentView.$el.addClass( 'has-bulk-selections' );
			this.modalContent.currentView.$el.removeClass( 'no-bulk-selections' );
		}

		this.handleBulkActionBar();
	},

	handleBulkActionBar() {
		const selectedCount = elementor.templates.getBulkSelectionItems().size ?? 0;
		const display = 0 === selectedCount ? 'none' : 'flex';

		this.modalContent.currentView.ui.bulkSelectedCount.html( `${ selectedCount } Selected` );
		this.modalContent.currentView.ui.bulkSelectionActionBar.css( 'display', display );

		// TODO: Temporary fix until the bulk action bar will be as separate view.
		const displayNavigationContainer = 0 === selectedCount ? 'flex' : 'none';
		this.modalContent.currentView.ui.navigationContainer.css( 'display', displayNavigationContainer );
	},

	selectAllCheckboxMinus() {
		if ( this.isListView() ) {
			this.modalContent.currentView.ui.bulkSelectAllCheckbox.addClass( 'checkbox-minus' );
		}
	},

	selectAllCheckboxNormal() {
		if ( this.isListView() ) {
			this.modalContent.currentView.ui.bulkSelectAllCheckbox.removeClass( 'checkbox-minus' );
		}
	},

	isListView() {
		return 'list' === elementor.templates.getViewSelection();
	},

	resetSortingUI() {
		Array.from( this.modalContent.currentView.ui?.orderInputs || [] ).forEach( function( input ) {
			input.checked = false;
		} );
	},
} );
