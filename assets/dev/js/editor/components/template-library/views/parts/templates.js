const TemplateLibraryTemplateLocalView = require( 'elementor-templates/views/template/local' );
const TemplateLibraryTemplateRemoteView = require( 'elementor-templates/views/template/remote' );
const TemplateLibraryTemplateCloudView = require( 'elementor-templates/views/template/cloud' );

import Select2 from 'elementor-editor-utils/select2.js';
import { SAVE_CONTEXTS, QUOTA_WARNINGS, QUOTA_BAR_STATES } from './../../constants';

const TemplateLibraryCollectionView = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-template-library-templates',

	id: 'elementor-template-library-templates',

	childViewContainer: '#elementor-template-library-templates-container',

	reorderOnSort: true,

	emptyView() {
		var EmptyView = require( 'elementor-templates/views/parts/templates-empty' );

		return new EmptyView();
	},

	ui: {
		textFilter: '#elementor-template-library-filter-text',
		selectFilter: '.elementor-template-library-filter-select',
		myFavoritesFilter: '#elementor-template-library-filter-my-favorites',
		orderInputs: '.elementor-template-library-order-input',
		orderLabels: 'label.elementor-template-library-order-label',
		searchInputIcon: '#elementor-template-library-filter-text-wrapper i',
		loadMoreAnchor: '#elementor-template-library-load-more-anchor',
		selectSourceFilter: '.elementor-template-library-filter-select-source .source-option',
		addNewFolder: '#elementor-template-library-add-new-folder',
		addNewFolderDivider: '.elementor-template-library-filter-toolbar-side-actions .divider',
		selectGridView: '#elementor-template-library-view-grid',
		selectListView: '#elementor-template-library-view-list',
		bulkSelectionActionBar: '.bulk-selection-action-bar',
		bulkActionBarDelete: '.bulk-selection-action-bar .bulk-delete i',
		bulkSelectedCount: '.bulk-selection-action-bar .selected-count',
		bulkSelectAllCheckbox: '#bulk-select-all',
		clearBulkSelections: '.bulk-selection-action-bar .clear-bulk-selections',
		bulkMove: '.bulk-selection-action-bar .bulk-move',
		bulkCopy: '.bulk-selection-action-bar .bulk-copy',
		quota: '.quota-progress-container .quota-progress-bar',
		quotaFill: '.quota-progress-container  .quota-progress-bar .quota-progress-bar-fill',
		quotaValue: '.quota-progress-container .quota-progress-bar-value',
		quotaWarning: '.quota-progress-container .progress-bar-container .quota-warning',
		quotaUpgrade: '.quota-progress-container .progress-bar-container .quota-warning a',
		navigationContainer: '#elementor-template-library-navigation-container',
	},

	events: {
		'input @ui.textFilter': 'onTextFilterInput',
		'change @ui.selectFilter': 'onSelectFilterChange',
		'change @ui.myFavoritesFilter': 'onMyFavoritesFilterChange',
		'mousedown @ui.orderLabels': 'onOrderLabelsClick',
		'click @ui.selectSourceFilter': 'onSelectSourceFilterChange',
		'click @ui.addNewFolder': 'onCreateNewFolderClick',
		'click @ui.selectGridView': 'onSelectGridViewClick',
		'click @ui.selectListView': 'onSelectListViewClick',
		'change @ui.bulkSelectAllCheckbox': 'onBulkSelectAllCheckbox',
		'click @ui.clearBulkSelections': 'onClearBulkSelections',
		'mouseenter @ui.bulkMove': 'onHoverBulkAction',
		'mouseenter @ui.bulkCopy': 'onHoverBulkAction',
		'click @ui.bulkMove': 'onClickBulkMove',
		'click @ui.bulkActionBarDelete': 'onBulkDeleteClick',
		'click @ui.bulkCopy': 'onClickBulkCopy',
		'click @ui.quotaUpgrade': 'onQuotaUpgradeClicked',
	},

	className: 'no-bulk-selections',

	resetQuotaBarStyles() {
		this.ui.quota.removeClass( [
			'quota-progress-bar-normal',
			'quota-progress-bar-warning',
			'quota-progress-bar-alert',
		] );
		this.ui.quotaFill.removeClass( [
			'quota-progress-bar-fill-normal',
			'quota-progress-bar-fill-warning',
			'quota-progress-bar-fill-alert',
		] );
	},

	setQuotaBarStyles( variant ) {
		this.ui.quota.addClass( `quota-progress-bar-${ variant }` );
		this.ui.quotaFill.addClass( `quota-progress-bar-fill-${ variant }` );
	},

	handleQuotaWarning( variant, quotaUsage ) {
		const message = QUOTA_WARNINGS[ variant ];

		if ( ! message ) {
			return;
		}

		this.ui.quotaWarning.html( sprintf( message, quotaUsage ) );
		this.ui.quotaWarning.show();
	},

	handleQuotaBar() {
		const quota = elementorAppConfig?.[ 'cloud-library' ]?.quota;

		const value = quota ? Math.round( ( quota.currentUsage / quota.threshold ) * 100 ) : 0;

		this.ui.quotaFill.css( 'width', `${ value }%` );

		this.ui.quotaValue.text( `${ quota?.currentUsage?.toLocaleString() }/${ quota?.threshold?.toLocaleString() }` );

		this.ui.quotaWarning.hide();

		this.resetQuotaBarStyles();

		const quotaState = this.resolveQuotaState( value );

		this.handleQuotaWarning( quotaState, value );

		this.setQuotaBarStyles( quotaState );
	},

	resolveQuotaState( value ) {
		if ( value < 80 ) {
			return QUOTA_BAR_STATES.NORMAL;
		} else if ( value < 100 ) {
			return QUOTA_BAR_STATES.WARNING;
		}

		return QUOTA_BAR_STATES.ALERT;
	},

	onClearBulkSelections() {
		elementor.templates.clearBulkSelectionItems();
		elementor.templates.layout.handleBulkActionBar();
		elementor.templates.layout.selectAllCheckboxNormal();
		this.deselectAllBulkItems();
	},

	deselectAllBulkItems() {
		if ( 'list' === elementor.templates.getViewSelection() || 'local' === elementor.templates.getFilter( 'source' ) ) {
			this.ui.bulkSelectAllCheckbox.prop( 'checked', false ).trigger( 'change' );
		} else {
			document.querySelectorAll( '.bulk-selected-item' ).forEach( function( item ) {
				item.classList.remove( 'bulk-selected-item' );
			} );
		}
	},

	onBulkSelectAllCheckbox() {
		const isChecked = this.$( '#bulk-select-all:checked' ).length > 0;

		if ( isChecked ) {
			elementor.templates.layout.selectAllCheckboxNormal();
		}

		this.updateBulkSelectedItems( isChecked );

		elementor.templates.layout.handleBulkActionBarUi();
	},

	updateBulkSelectedItems( isChecked ) {
		document.querySelectorAll( '.bulk-selection-item-checkbox' ).forEach( function( checkbox ) {
			checkbox.checked = isChecked;
			const templateId = checkbox.dataset.template_id;
			const parentDiv = checkbox.closest( '.elementor-template-library-template' );

			if ( isChecked ) {
				elementor.templates.addBulkSelectionItem( templateId );
				parentDiv?.classList.add( 'bulk-selected-item' );
			} else {
				elementor.templates.removeBulkSelectionItem( templateId );
				parentDiv?.classList.remove( 'bulk-selected-item' );
			}
		} );
	},

	onBulkDeleteClick() {
		this.ui.bulkActionBarDelete.toggleClass( 'disabled' );

		elementor.templates.onBulkDeleteClick()
			.finally( () => {
				this.ui.bulkActionBarDelete.toggleClass( 'disabled' );
				elementor.templates.layout.handleBulkActionBar();
			} );
	},

	comparators: {
		title( model ) {
			return model.get( 'title' ).toLowerCase();
		},
		popularityIndex( model ) {
			var popularityIndex = model.get( 'popularityIndex' );

			if ( ! popularityIndex ) {
				popularityIndex = model.get( 'date' );
			}

			return -popularityIndex;
		},
		trendIndex( model ) {
			var trendIndex = model.get( 'trendIndex' );

			if ( ! trendIndex ) {
				trendIndex = model.get( 'date' );
			}

			return -trendIndex;
		},
	},

	getChildView( childModel ) {
		const sourceMappings = {
			local: TemplateLibraryTemplateLocalView,
			remote: TemplateLibraryTemplateRemoteView,
			cloud: TemplateLibraryTemplateCloudView,
		};

		const activeSource = childModel.get( 'source' ) ? childModel.get( 'source' ) : 'local';

		/**
		 * Filter template source.
		 *
		 * @param bool   isRemote     - If `true` the source is a remote source.
		 * @param string activeSource - The current template source.
		 */
		const isRemote = elementor.hooks.applyFilters( 'templates/source/is-remote', 'remote' === activeSource, activeSource );

		return isRemote
			? TemplateLibraryTemplateRemoteView
			: sourceMappings[ activeSource ] || TemplateLibraryTemplateLocalView;
	},

	initialize() {
		this.handleQuotaBar = this.handleQuotaBar.bind( this );
		this.handleQuotaUpdate = this.handleQuotaUpdate.bind( this );
		this.listenTo( elementor.channels.templates, 'filter:change', this._renderChildren );
		this.listenTo( elementor.channels.templates, 'quota:updated', this.handleQuotaUpdate );
		this.debouncedSearchTemplates = _.debounce( this.searchTemplates, 300 );
	},

	handleQuotaUpdate() {
		const activeSource = elementor.templates.getFilter( 'source' ) ?? 'local';

		if ( 'cloud' === activeSource ) {
			$e.components.get( 'cloud-library' ).utils.getQuotaConfig()
				.then( () => {
					this.handleQuotaBar();
				} );
		}
	},

	filter( childModel ) {
		const activeSource = elementor.templates.getFilter( 'source' );

		if ( 'cloud' === activeSource ) {
			return true; // Filtering happens on the backend.
		}

		var filterTerms = elementor.templates.getFilterTerms(),
			passingFilter = true;

		jQuery.each( filterTerms, function( filterTermName ) {
			var filterValue = elementor.templates.getFilter( filterTermName );

			if ( ! filterValue ) {
				return;
			}

			if ( this.callback ) {
				var callbackResult = this.callback.call( childModel, filterValue );

				if ( ! callbackResult ) {
					passingFilter = false;
				}

				return callbackResult;
			}

			var filterResult = filterValue === childModel.get( filterTermName );

			if ( ! filterResult ) {
				passingFilter = false;
			}

			return filterResult;
		} );

		return passingFilter;
	},

	order( by, reverseOrder ) {
		let comparator = this.comparators[ by ] || by;

		if ( 'cloud' === elementor.templates.getFilter( 'source' ) ) {
			this.handleCloudOrder( by, reverseOrder );

			return;
		}

		if ( reverseOrder ) {
			comparator = this.reverseOrder( comparator );
		}

		this.collection.comparator = comparator;

		this.collection.sort();
	},

	handleCloudOrder( by, reverseOrder ) {
		elementor.templates.setFilter( 'orderby', by );
		elementor.templates.setFilter( 'order', reverseOrder ? 'desc' : 'asc' );

		this.onClearBulkSelections();

		this.collection.reset();

		elementor.templates.layout.showLoadingView();

		elementor.templates.loadMore( {
			onUpdate: () => {
				elementor.templates.layout.hideLoadingView();
			},
			search: this.ui.textFilter.val(),
			refresh: true,
		} );
	},

	reverseOrder( comparator ) {
		if ( 'function' !== typeof comparator ) {
			var comparatorValue = comparator;

			comparator = function( model ) {
				return model.get( comparatorValue );
			};
		}

		return function( left, right ) {
			const l = comparator( left );

			if ( undefined === l ) {
				return -1;
			}

			const r = comparator( right );
			if ( undefined === r ) {
				return 1;
			}

			if ( l < r ) {
				return 1;
			}
			if ( l > r ) {
				return -1;
			}
			return 0;
		};
	},

	addSourceData() {
		var isEmpty = this.children.isEmpty();

		this.$el.attr( 'data-template-source', isEmpty ? 'empty' : elementor.templates.getFilter( 'source' ) );
	},

	addViewData() {
		const view = elementor.templates.getViewSelection();

		this.$el.attr( 'data-template-view', view );
	},

	setFiltersUI() {
		if ( ! this.select2Instance && this.$( this.ui.selectFilter ).length ) {
			const $filters = this.$( this.ui.selectFilter ),
				select2Options = {
					placeholder: __( 'Category', 'elementor' ),
					allowClear: true,
					width: 150,
					dropdownParent: this.$el,
				};

			this.select2Instance = new Select2( {
				$element: $filters,
				options: select2Options,
			} );
		}
	},

	setMasonrySkin() {
		var masonry = new elementorModules.utils.Masonry( {
			container: this.$childViewContainer,
			items: this.$childViewContainer.children(),
		} );

		this.$childViewContainer.imagesLoaded( masonry.run.bind( masonry ) );
	},

	toggleFilterClass() {
		this.$el.toggleClass( 'elementor-templates-filter-active', ! ! ( elementor.templates.getFilter( 'text' ) || elementor.templates.getFilter( 'favorite' ) ) );
	},

	isPageOrLandingPageTemplates() {
		const templatesType = elementor.templates.getFilter( 'type' );

		return 'page' === templatesType || 'lp' === templatesType;
	},

	onDestroy() {
		if ( this.removeScrollListener ) {
			this.removeScrollListener();
		}
	},

	onRender() {
		elementor.templates.clearBulkSelectionItems();
		const activeSource = elementor.templates.getFilter( 'source' );
		const templateType = elementor.templates.getFilter( 'type' );

		if ( 'remote' === activeSource && 'page' !== templateType && 'lb' !== templateType ) {
			this.setFiltersUI();
		}

		if ( 'cloud' === activeSource ) {
			const isFolderView = elementor.templates.getFilter( 'parentId' );
			const location = isFolderView
				? elementor.editorEvents.config.secondaryLocations.templateLibrary.cloudTabFolder
				: elementor.editorEvents.config.secondaryLocations.templateLibrary.cloudTab;

			elementor.templates.eventManager.sendPageViewEvent( { location } );

			this.handleQuotaBar();
		}

		if ( 'local' === activeSource ) {
			elementor.templates.eventManager.sendPageViewEvent( {
				location: elementor.editorEvents.config.secondaryLocations.templateLibrary.siteTab,
			} );
		}
	},

	onRenderCollection() {
		this.addSourceData();

		this.toggleFilterClass();

		const activeSource = elementor.templates.getFilter( 'source' );

		if ( 'remote' === activeSource && ! this.isPageOrLandingPageTemplates() ) {
			this.setMasonrySkin();
		}

		if ( 'cloud' === activeSource ) {
			this.handleLoadMore();

			this.addViewData();

			this.handleQuotaUpdate();
		}
	},

	onBeforeRenderEmpty() {
		this.addSourceData();
	},

	onTextFilterInput() {
		const activeSource = elementor.templates.getFilter( 'source' );

		if ( [ 'cloud', 'local' ].includes( activeSource ) ) {
			elementor.templates.clearBulkSelectionItems();
			elementor.templates.layout.handleBulkActionBar();
		}

		if ( 'cloud' === activeSource ) {
			this.debouncedSearchTemplates( activeSource );
			return;
		}

		elementor.templates.setFilter( 'text', this.ui.textFilter.val() );
	},

	async searchTemplates( source ) {
		this.showLoadingSpinner();

		try {
			await elementor.templates.searchTemplates( {
				source,
				search: this.ui.textFilter.val(),
			} );
		} finally {
			this.showSearchIcon();
		}
	},

	showLoadingSpinner() {
		this.ui.searchInputIcon.removeClass( 'eicon-search' ).addClass( 'eicon-loading eicon-animation-spin' );
	},

	showSearchIcon() {
		this.ui.searchInputIcon.removeClass( 'eicon-loading eicon-animation-spin' ).addClass( 'eicon-search' );
	},

	onSelectFilterChange( event ) {
		var $select = jQuery( event.currentTarget ),
			filterName = $select.data( 'elementor-filter' );

		elementor.templates.setFilter( filterName, $select.val() );
	},

	onSelectSourceFilterChange( event ) {
		elementor.templates.onSelectSourceFilterChange( event );
	},

	onSelectGridViewClick() {
		elementor.templates.onSelectViewChange( 'grid' );
	},

	onSelectListViewClick() {
		elementor.templates.onSelectViewChange( 'list' );
	},

	onMyFavoritesFilterChange() {
		elementor.templates.setFilter( 'favorite', this.ui.myFavoritesFilter[ 0 ].checked );
	},

	onOrderLabelsClick( event ) {
		const $clickedInput = jQuery( event.currentTarget.control );
		let toggle;

		if ( ! $clickedInput[ 0 ].checked ) {
			toggle = 'asc' !== $clickedInput.data( 'default-ordering-direction' );
		} else {
			toggle = ! $clickedInput.hasClass( 'elementor-template-library-order-reverse' );
		}

		$clickedInput.prop( 'checked', true );

		$clickedInput.toggleClass( 'elementor-template-library-order-reverse', toggle );

		this.order( $clickedInput.val(), toggle );
	},

	handleLoadMore() {
		if ( this.removeScrollListener ) {
			this.removeScrollListener();
		}

		const scrollableContainer = elementor?.templates?.layout?.modal.getElements( 'message' );

		const listener = () => {
			const scrollTop = scrollableContainer.scrollTop();
			const scrollHeight = scrollableContainer[ 0 ].scrollHeight;
			const clientHeight = scrollableContainer.outerHeight();

			const scrollPercentage = ( scrollTop / ( scrollHeight - clientHeight ) ) * 100;

			const canLoadMore = elementor.templates.canLoadMore() && ! elementor.templates.isLoading();

			if ( scrollPercentage < 90 || ! canLoadMore ) {
				return;
			}

			this.ui.loadMoreAnchor.toggleClass( 'elementor-visibility-hidden' );
			elementor.templates.layout.selectAllCheckboxMinus();

			elementor.templates.loadMore( {
				onUpdate: () => {
					this.ui.loadMoreAnchor.toggleClass( 'elementor-visibility-hidden' );
				},
				search: this.ui.textFilter.val(),
			} );
		};

		scrollableContainer.on( 'scroll', listener );

		this.removeScrollListener = () => scrollableContainer.off( 'scroll', listener );
	},

	onCreateNewFolderClick() {
		const activeSource = elementor.templates.getFilter( 'source' );

		if ( 'cloud' !== activeSource ) {
			return;
		}

		elementor.templates.createFolder( {
			source: activeSource,
		},
		{
			onSuccess: () => {
				$e.routes.refreshContainer( 'library' );
			},
		} );
	},

	onHoverBulkAction() {
		if ( this.hasFolderInBulkSelection() ) {
			this.ui.bulkMove.find( 'i' ).css( 'cursor', 'not-allowed' );
			this.ui.bulkCopy.find( 'i' ).css( 'cursor', 'not-allowed' );
		} else {
			this.ui.bulkMove.find( 'i' ).css( 'cursor', 'pointer' );
			this.ui.bulkCopy.find( 'i' ).css( 'cursor', 'pointer' );
		}
	},

	onClickBulkMove() {
		if ( this.hasFolderInBulkSelection() ) {
			return;
		}

		$e.route( 'library/save-template', {
			model: this.model,
			context: SAVE_CONTEXTS.BULK_MOVE,
		} );
	},

	hasFolderInBulkSelection() {
		const bulkSelectedItems = elementor.templates.getBulkSelectionItems();

		return this.collection.some( ( model ) => {
			const templateId = model.get( 'template_id' );
			const type = model.get( 'type' );

			return bulkSelectedItems.has( templateId ) && 'folder' === type;
		} );
	},

	onClickBulkCopy() {
		if ( this.hasFolderInBulkSelection() ) {
			return;
		}

		$e.route( 'library/save-template', {
			model: this.model,
			context: SAVE_CONTEXTS.BULK_COPY,
		} );
	},

	onQuotaUpgradeClicked() {
		const quota = elementorAppConfig?.[ 'cloud-library' ]?.quota;

		const value = quota ? Math.round( ( quota.currentUsage / quota.threshold ) * 100 ) : 0;

		elementor.templates.eventManager.sendUpgradeClickedEvent( {
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.quotaBar,
			upgrade_position: `quota bar ${ value ? value + '%' : '' }`,
		} );
	},
} );

module.exports = TemplateLibraryCollectionView;
