const TemplateLibraryTemplateModel = require( 'elementor-templates/models/template' );
const TemplateLibraryCollection = require( 'elementor-templates/collections/templates' );
const FolderCollectionView = require( './folders/folders-list' );

const LOAD_MORE_ID = 0;

import { SAVE_CONTEXTS } from './../../constants';

const TemplateLibrarySaveTemplateView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-save-template',

	template: '#tmpl-elementor-template-library-save-template',

	ui: {
		form: '#elementor-template-library-save-template-form',
		submitButton: '#elementor-template-library-save-template-submit',
		ellipsisIcon: '.cloud-library-form-inputs .eicon-ellipsis-h',
		foldersList: '.cloud-folder-selection-dropdown ul',
		foldersDropdown: '.cloud-folder-selection-dropdown',
		foldersListContainer: '.cloud-folder-selection-dropdown-list',
		removeFolderSelection: '.source-selections .selected-folder i',
		selectedFolder: '.selected-folder',
		selectedFolderText: '.selected-folder-text',
		hiddenInputSelectedFolder: '#parentId',
		templateNameInput: '#elementor-template-library-save-template-name',
		localInput: '.source-selections-input.local',
		cloudInput: '.source-selections-input.cloud',
		sourceSelectionCheckboxes: '.source-selections-input input[type="checkbox"]',
		upgradeBadge: '.source-selections-input.cloud .upgrade-badge',
		infoIcon: '.source-selections-input.cloud .eicon-info',
	},

	events: {
		'submit @ui.form': 'onFormSubmit',
		'click @ui.ellipsisIcon': 'onEllipsisIconClick',
		'click @ui.foldersList': 'onFoldersListClick',
		'click @ui.removeFolderSelection': 'onRemoveFolderSelectionClick',
		'click @ui.selectedFolderText': 'onSelectedFolderTextClick',
		'change @ui.sourceSelectionCheckboxes': 'maybeAllowOnlyOneCheckboxToBeChecked',
		'click @ui.infoIcon': 'showInfoTip',
	},

	onRender() {
		if ( undefined === elementorAppConfig[ 'cloud-library' ].quota && this.templateHelpers()?.canSaveToCloud ) {
			elementor.templates.layout.showLoadingView();

			elementorCommon.ajax.addRequest( 'get_quota', {
				data: {
					source: 'cloud',
				},
				success: ( data ) => {
					elementorAppConfig[ 'cloud-library' ].quota = data;
					this.handleOnRender();
					elementor.templates.layout.hideLoadingView();
				},
				error: () => {
					delete elementorAppConfig[ 'cloud-library' ].quota;
					this.handleOnRender();
					elementor.templates.layout.hideLoadingView();
				},
			} );
		} else {
			this.handleOnRender();
		}
	},

	handleOnRender() {
		const context = this.getOption( 'context' );

		if ( SAVE_CONTEXTS.SAVE === context && elementor.templates.hasCloudLibraryQuota() ) {
			this.$( '.source-selections-input #cloud' ).prop( 'checked', true );
		}

		if ( SAVE_CONTEXTS.MOVE === context || SAVE_CONTEXTS.COPY === context ) {
			this.handleSingleActionContextUiState();
		}

		if ( SAVE_CONTEXTS.BULK_MOVE === context || SAVE_CONTEXTS.BULK_COPY === context ) {
			this.handleBulkActionContextUiState();
		}

		if ( ! elementor.templates.hasCloudLibraryQuota() ) {
			this.handleCloudLibraryPromo();
		}
	},

	handleSingleActionContextUiState() {
		this.ui.templateNameInput.val( this.model.get( 'title' ) );
		this.handleContextUiStateChecboxes();
	},

	handleBulkActionContextUiState() {
		this.ui.templateNameInput.remove();
		this.handleContextUiStateChecboxes();
	},

	handleContextUiStateChecboxes() {
		const fromSource = elementor.templates.getFilter( 'source' );

		if ( 'local' === fromSource ) {
			this.$( '.source-selections-input #cloud' ).prop( 'checked', true );
			this.ui.localInput.addClass( 'disabled' );
		}
	},

	handleCloudLibraryPromo() {
		if ( SAVE_CONTEXTS.SAVE === this.getOption( 'context' ) ) {
			this.$( '.source-selections-input #local' ).prop( 'checked', true );
		} else {
			this.$( '.source-selections-input #local, .source-selections-input.local label' ).css( 'pointer-events', 'none' );
		}

		this.$( '.source-selections-input #cloud' ).prop( 'checked', false );
		this.$( '.source-selections-input #cloud, .source-selections-input.cloud label' ).css( 'pointer-events', 'none' );

		this.ui.ellipsisIcon.css( 'pointer-events', 'none' );
		this.ui.upgradeBadge.css( 'display', 'inline' );
	},

	getSaveType() {
		let type;

		if ( SAVE_CONTEXTS.MOVE === this.getOption( 'context' ) || SAVE_CONTEXTS.COPY === this.getOption( 'context' ) ) {
			type = this.model.get( 'type' );
		} else if ( this.model ) {
			type = this.model.get( 'elType' );
		} else if ( elementor.config.document.library && elementor.config.document.library.save_as_same_type ) {
			type = elementor.config.document.type;
		} else {
			type = 'page';
		}

		return type;
	},

	templateHelpers() {
		const saveType = this.getSaveType(),
			templateType = elementor.templates.getTemplateTypes( saveType ),
			saveContext = this.getOption( 'context' );

		return templateType[ `${ saveContext }Dialog` ];
	},

	onFormSubmit( event ) {
		event.preventDefault();

		var formData = this.ui.form.elementorSerializeObject(),
			JSONParams = { remove: [ 'default' ] };

		formData.content = this.model ? [ this.model.toJSON( JSONParams ) ] : elementor.elements.toJSON( JSONParams );

		this.updateSourceSelections( formData );

		if ( ! formData?.source && this.templateHelpers()?.canSaveToCloud ) {
			this.showEmptySourceErrorDialog();

			return;
		}

		this.ui.submitButton.addClass( 'elementor-button-state' );

		this.updateSaveContext( formData );

		this.updateToastConfig( formData );

		elementor.templates.saveTemplate( this.getSaveType(), formData );
	},

	updateSourceSelections( formData ) {
		const selectedSources = [ 'cloud', 'local' ].filter( ( type ) => formData[ type ] );

		if ( ! selectedSources.length ) {
			return;
		}

		formData.source = selectedSources;

		[ 'cloud', 'local' ].forEach( ( type ) => delete formData[ type ] );
	},

	showEmptySourceErrorDialog() {
		elementorCommon.dialogsManager.createWidget( 'alert', {
			id: 'elementor-template-library-error-dialog',
			headerMessage: __( 'An error occured.', 'elementor' ),
			message: __( 'Please select at least one location.', 'elementor' ),
		} ).show();
	},

	updateSaveContext( formData ) {
		const saveContext = this.getOption( 'context' ) ?? SAVE_CONTEXTS.SAVE;

		formData.save_context = saveContext;

		if ( [ SAVE_CONTEXTS.MOVE, SAVE_CONTEXTS.BULK_MOVE, SAVE_CONTEXTS.COPY, SAVE_CONTEXTS.BULK_COPY ].includes( saveContext ) ) {
			formData.from_source = elementor.templates.getFilter( 'source' );
			formData.from_template_id = [ SAVE_CONTEXTS.MOVE, SAVE_CONTEXTS.COPY ].includes( saveContext )
				? this.model.get( 'template_id' )
				: Array.from( elementor.templates.getBulkSelectionItems() );
		}
	},

	updateToastConfig( formData ) {
		if ( ! formData.source?.length ) {
			return;
		}

		const lastSource = formData.source.at( -1 ),
			saveContext = this.getOption( 'context' ) ?? SAVE_CONTEXTS.SAVE,
			toastMessage = this.getToastMessage( lastSource, saveContext, formData );

		if ( ! toastMessage ) {
			return;
		}

		const toastButtons = formData.source?.length > 1
			? null
			: this.getToastButtons( lastSource, formData?.parentId?.trim() );

		elementor.templates.setToastConfig( {
			show: true,
			options: {
				message: toastMessage,
				buttons: toastButtons,
				position: {
					my: 'right bottom',
					at: 'right-10 bottom-10',
					of: '#elementor-template-library-modal .dialog-lightbox-widget-content',
				},
			},
		} );
	},

	getToastMessage( lastSource, saveContext, formData ) {
		const key = `${ lastSource }_${ saveContext }`;

		if ( formData.source?.length > 1 ) {
			return __( 'Template saved to your Site and Cloud Templates.', 'elementor' );
		}

		const actions = {
			[ `local_${ SAVE_CONTEXTS.SAVE }` ]: __( 'Template saved to your Site Templates.', 'elementor' ),
			[ `cloud_${ SAVE_CONTEXTS.SAVE }` ]: __( 'Template saved to your Cloud Templates.', 'elementor' ),
			[ `local_${ SAVE_CONTEXTS.MOVE }` ]: this.getFormattedToastMessage( 'moved to your Site Templates', formData.title ),
			[ `cloud_${ SAVE_CONTEXTS.MOVE }` ]: this.getFormattedToastMessage( 'moved to your Cloud Templates', formData.title ),
			[ `local_${ SAVE_CONTEXTS.COPY }` ]: this.getFormattedToastMessage( 'copied to your Site Templates', formData.title ),
			[ `cloud_${ SAVE_CONTEXTS.COPY }` ]: this.getFormattedToastMessage( 'copied to your Cloud Templates', formData.title ),
			[ `local_${ SAVE_CONTEXTS.BULK_MOVE }` ]: this.getFormattedToastMessage( 'moved to your Site Templates', null, formData.from_template_id?.length ),
			[ `cloud_${ SAVE_CONTEXTS.BULK_MOVE }` ]: this.getFormattedToastMessage( 'moved to your Cloud Templates', null, formData.from_template_id?.length ),
			[ `local_${ SAVE_CONTEXTS.BULK_COPY }` ]: this.getFormattedToastMessage( 'copied to your Site Templates', null, formData.from_template_id?.length ),
			[ `cloud_${ SAVE_CONTEXTS.BULK_COPY }` ]: this.getFormattedToastMessage( 'copied to your Cloud Templates', null, formData.from_template_id?.length ),
		};

		return actions[ key ] ?? false;
	},

	getFormattedToastMessage( action, title, count ) {
		if ( count !== undefined ) {
			/* Translators: 1: Number of templates, 2: Action performed (e.g., "moved", "copied"). */
			return sprintf( __( '%1$d Template(s) %2$s.', 'elementor' ), count, action );
		}

		/* Translators: 1: Template title or "Template" fallback, 2: Action performed. */
		return sprintf( __( '%1$s %2$s.', 'elementor' ), title ? `"${ title }"` : __( 'Template', 'elementor' ), action );
	},

	getToastButtons( lastSource, parentId ) {
		const parsedParentId = parseInt( parentId, 10 ) || null;

		return [
			{
				name: 'template_after_save',
				text: __( 'View', 'elementor' ),
				callback: () => this.navigateToSavedSource( lastSource, parsedParentId ),
			},
		];
	},

	navigateToSavedSource( lastSource, parentId ) {
		elementor.templates.setSourceSelection( lastSource );
		elementor.templates.setFilter( 'source', lastSource, true );

		if ( parentId ) {
			elementor.templates.setFilter( 'parent', parentId );

			const model = new TemplateLibraryTemplateModel( { template_id: parentId } );

			$e.route( 'library/view-folder', { model } );

			return;
		}

		$e.routes.refreshContainer( 'library' );
	},

	onSelectedFolderTextClick() {
		if ( ! this.folderCollectionView ) {
			this.onEllipsisIconClick();

			return;
		}

		if ( ! this.ui.foldersDropdown.is( ':visible' ) ) {
			this.ui.foldersDropdown.show();
		}
	},

	async onEllipsisIconClick() {
		if ( this.ui.foldersDropdown.is( ':visible' ) ) {
			this.ui.foldersDropdown.hide();

			return;
		}

		this.ui.foldersDropdown.show();

		if ( ! this.folderCollectionView ) {
			this.folderCollectionView = new FolderCollectionView( {
				collection: new TemplateLibraryCollection(),
			} );

			this.addSpinner();
			this.renderFolderDropdown();

			try {
				await this.fetchFolders();
			} finally {
				this.removeSpinner();
				this.disableSelectedFolder();
			}
		}
	},

	renderFolderDropdown() {
		this.ui.foldersListContainer.html( this.folderCollectionView.render()?.el );
	},

	addSpinner() {
		const spinner = new TemplateLibraryTemplateModel( {
			template_id: LOAD_MORE_ID,
			title: '<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>',
		} );

		this.folderCollectionView.collection.add( spinner );
	},

	removeSpinner() {
		const spinner = this.folderCollectionView.collection.findWhere( { template_id: LOAD_MORE_ID } );

		if ( spinner ) {
			this.folderCollectionView.collection.remove( spinner );
		}
	},

	fetchFolders() {
		return new Promise( ( resolve ) => {
			const offset = this.folderCollectionView.collection.length - 1;

			const ajaxOptions = {
				data: {
					source: 'cloud',
					offset,
				},
				success: ( response ) => {
					this.folderCollectionView.collection.add( response?.templates );

					if ( this.shouldAddLoadMoreItem( response ) ) {
						this.addLoadMoreItem();
					}

					resolve( response );
				},
				error: ( error ) => {
					elementor.templates.showErrorDialog( error );

					resolve();
				},
			};

			elementorCommon.ajax.addRequest( 'get_folders', ajaxOptions );
		} );
	},

	disableSelectedFolder() {
		if ( ! SAVE_CONTEXTS.MOVE === this.getOption( 'context' ) ) {
			return;
		}

		if ( ! this.model || ! Number.isInteger( this.model.get( 'parentId' ) ) ) {
			return;
		}

		this.$( `.folder-list li[data-id="${ this.model.get( 'parentId' ) }"]` ).addClass( 'disabled' );
	},

	onFoldersListClick( event ) {
		const { id, value } = event.target.dataset;

		if ( ! id || ! value ) {
			return;
		}

		if ( this.clickedOnLoadMore( id ) ) {
			this.loadMoreFolders();

			return;
		}

		this.handleFolderSelected( id, value );
	},

	clickedOnLoadMore( templateId ) {
		return LOAD_MORE_ID === +templateId;
	},

	handleFolderSelected( id, value ) {
		this.highlightSelectedFolder( id );
		this.ui.foldersDropdown.hide();
		this.ui.ellipsisIcon.hide();
		this.ui.selectedFolderText.html( value );
		this.ui.selectedFolder.show();
		this.ui.hiddenInputSelectedFolder.val( id );
	},

	highlightSelectedFolder( id ) {
		this.clearSelectedFolder();
		this.$( `.folder-list li[data-id="${ id }"]` ).addClass( 'selected' );
	},

	clearSelectedFolder() {
		this.$( '.folder-list li.selected' ).removeClass( 'selected' );
	},

	onRemoveFolderSelectionClick() {
		this.clearSelectedFolder();
		this.ui.selectedFolderText.html( '' );
		this.ui.selectedFolder.hide();
		this.ui.ellipsisIcon.show();
		this.ui.hiddenInputSelectedFolder.val( '' );
		this.ui.foldersDropdown.hide();
	},

	async loadMoreFolders() {
		this.removeLoadMoreItem();
		this.addSpinner();

		try {
			await this.fetchFolders();
		} finally {
			this.removeSpinner();
			this.disableSelectedFolder();
		}
	},

	shouldAddLoadMoreItem( response ) {
		return this.folderCollectionView.collection.length < response?.total;
	},

	addLoadMoreItem() {
		this.folderCollectionView.collection.add( {
			template_id: LOAD_MORE_ID,
			title: __( 'Load More', 'elementor' ),
		} );
	},

	removeLoadMoreItem() {
		const loadMore = this.folderCollectionView.collection.findWhere( { template_id: LOAD_MORE_ID } );

		if ( loadMore ) {
			this.folderCollectionView.collection.remove( loadMore );
		}
	},

	maybeAllowOnlyOneCheckboxToBeChecked( event ) {
		if ( this.moreThanOneCheckboxCanBeChecked() ) {
			return;
		}

		const selectedCheckbox = event.currentTarget;

		this.ui.sourceSelectionCheckboxes.each( ( _, checkbox ) => {
			const wrapper = this.$( checkbox ).closest( '.source-selections-input' );

			if ( checkbox !== selectedCheckbox ) {
				if ( selectedCheckbox.checked ) {
					wrapper.addClass( 'disabled' );
					checkbox.checked = false;
				} else {
					wrapper.removeClass( 'disabled' );
				}
			}
		} );
	},

	moreThanOneCheckboxCanBeChecked() {
		return SAVE_CONTEXTS.SAVE === this.getOption( 'context' ) ||
			'cloud' !== elementor.templates.getFilter( 'source' );
	},

	showInfoTip() {
		if ( this.dialog ) {
			this.dialog.hide();
		}

		const inlineStartKey = elementorCommon.config.isRTL ? 'left' : 'right';

		this.dialog = elementor.dialogsManager.createWidget( 'buttons', {
			id: 'elementor-library--infotip__dialog',
			effects: {
				show: 'show',
				hide: 'hide',
			},
			position: {
				of: this.ui.infoIcon,
				at: `${ inlineStartKey }+90 top-60`,
			},
		} )
		.setMessage( __(
			'With Cloud Templates, you can reuse saved assets across all the websites you’re working on.',
			'elementor',
		) )
		.addButton( {
			name: 'learn_more',
			text: __(
				'Learn more',
				'elementor',
			),
			classes: '',
			callback: () => open( '', '_blank' ),
		} );

		this.dialog.getElements( 'header' ).remove();
		this.dialog.show();
	},
} );

module.exports = TemplateLibrarySaveTemplateView;
