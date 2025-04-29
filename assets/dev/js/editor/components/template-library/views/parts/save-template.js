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
		ellipsisIcon: '.cloud-library-form-inputs .ellipsis-container',
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
		infoIcon: '.source-selections-input.cloud .eicon-info',
		connect: '#elementor-template-library-connect__badge',
		connectBadge: '.source-selections-input.cloud .connect-badge',
		cloudFormInputs: '.cloud-library-form-inputs',
		upgradeBadge: '.source-selections-input.cloud upgrade-badge',
	},

	events: {
		'submit @ui.form': 'onFormSubmit',
		'click @ui.ellipsisIcon': 'onEllipsisIconClick',
		'click @ui.foldersList': 'onFoldersListClick',
		'click @ui.removeFolderSelection': 'onRemoveFolderSelectionClick',
		'click @ui.selectedFolderText': 'onSelectedFolderTextClick',
		'click @ui.upgradeBadge': 'onUpgradeBadgeClicked',
		'change @ui.sourceSelectionCheckboxes': 'handleSourceSelectionChange',
		'mouseenter @ui.infoIcon': 'showInfoTip',
		'mouseenter @ui.connect': 'showConnectInfoTip',
		'input @ui.templateNameInput': 'onTemplateNameInputChange',
	},

	onRender() {
		if ( 'undefined' === typeof elementorAppConfig[ 'cloud-library' ]?.quota && this.templateHelpers()?.canSaveToCloud ) {
			elementor.templates.layout.showLoadingView();

			$e.components.get( 'cloud-library' ).utils.setQuotaConfig()
				.then( ( data ) => {
					elementorAppConfig[ 'cloud-library' ].quota = data;
				} )
				.catch( () => {
					delete elementorAppConfig[ 'cloud-library' ].quota;
				} )
				.finally( () => {
					this.handleOnRender();
					elementor.templates.layout.hideLoadingView();
				} );
		} else {
			this.handleOnRender();
		}
	},

	handleOnRender() {
		setTimeout( () => this.ui.templateNameInput.trigger( 'focus' ) );

		elementor.templates.eventManager.sendPageViewEvent( {
			location: elementor.editorEvents.config.secondaryLocations.templateLibrary[ `${ context }Modal` ],
		} );

		const context = this.getOption( 'context' );

		if ( SAVE_CONTEXTS.SAVE === context && elementor.templates.hasCloudLibraryQuota() ) {
			this.handleSaveAction();
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

		if ( this.cloudMaxCapacityReached() ) {
			this.handleCloudLibraryPromo( 'max-capacity' );
		}

		if ( ! elementor.config.library_connect.is_connected ) {
			this.handleElementorConnect();
		}
	},

	cloudMaxCapacityReached() {
		return 'undefined' !== typeof elementorAppConfig[ 'cloud-library' ]?.quota &&
			0 < elementorAppConfig[ 'cloud-library' ].quota?.threshold &&
			elementorAppConfig[ 'cloud-library' ].quota?.currentUsage >= elementorAppConfig[ 'cloud-library' ].quota?.threshold;
	},

	handleSaveAction() {
		this.maybeEnableSaveButton();
	},

	handleSingleActionContextUiState() {
		const title = this.model.get( 'title' );

		this.ui.templateNameInput.val( title );

		this.handleContextUiStateChecboxes();

		this.maybeEnableSaveButton();
	},

	maybeEnableSaveButton() {
		if ( ! this.templateHelpers()?.canSaveToCloud ) {
			return;
		}

		const isAnyChecked = this.ui.sourceSelectionCheckboxes.is( ':checked' );

		const title = this.ui.templateNameInput.val().trim();

		const isTitleFilled = this.ui.templateNameInput.is( ':visible' )
			? elementor.templates.isTemplateTitleValid( title )
			: true;

		this.updateSubmitButtonState( ! isAnyChecked || ! isTitleFilled );
	},

	handleBulkActionContextUiState() {
		this.ui.templateNameInput.remove();
		this.handleContextUiStateChecboxes();
		this.maybeEnableSaveButton();
	},

	handleContextUiStateChecboxes() {
		const fromSource = elementor.templates.getFilter( 'source' );

		if ( 'local' === fromSource ) {
			this.$( '.source-selections-input #cloud' ).prop( 'checked', true );
			this.ui.localInput.addClass( 'disabled' );
		}
	},

	handleCloudLibraryPromo( stateClass = 'promotion' ) {
		if ( SAVE_CONTEXTS.SAVE === this.getOption( 'context' ) ) {
			this.$( '.source-selections-input #local' ).prop( 'checked', true );
		} else {
			this.$( '.source-selections-input #local, .source-selections-input.local label' ).css( 'pointer-events', 'none' );
		}

		this.$( '.source-selections-input #cloud' ).prop( 'checked', false );

		this.ui.cloudFormInputs.addClass( stateClass );

		elementor.templates.eventManager.sendPageViewEvent( {
			location: elementor.editorEvents.config.secondaryLocations.templateLibrary.saveModalSelectUpgrade,
		} );
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

		formData.parentTitle = formData.parentId ? this.ui.selectedFolderText.html() : '';

		formData.content = this.model ? [ this.model.toJSON( JSONParams ) ] : elementor.elements.toJSON( JSONParams );

		this.updateSourceSelections( formData );

		if ( ! formData?.source && this.templateHelpers()?.canSaveToCloud ) {
			this.showEmptySourceErrorDialog();

			return;
		}

		this.ui.submitButton.addClass( 'elementor-button-state' );

		this.updateSaveContext( formData );

		this.updateToastConfig( formData );

		this.updateSourceState( formData );

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

	showEmptySourceErrorDialog( ) {
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
			: this.getToastButtons( lastSource, formData?.parentId?.trim(), formData?.parentTitle?.trim() );

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

	updateSourceState( formData ) {
		if ( ! formData.source?.length ) {
			return;
		}

		const saveContext = this.getOption( 'context' ) ?? SAVE_CONTEXTS.SAVE;

		if ( SAVE_CONTEXTS.SAVE !== saveContext ) {
			return;
		}

		const lastSource = formData.source.at( -1 );
		elementor.templates.setSourceSelection( lastSource );
		elementor.templates.setFilter( 'source', lastSource, true );
	},

	getToastMessage( lastSource, saveContext, formData ) {
		const key = `${ lastSource }_${ saveContext }`;

		if ( formData.source?.length > 1 ) {
			return __( 'Template saved to your Site and Cloud Templates.', 'elementor' );
		}

		const actions = {
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

	getToastButtons( lastSource, parentId, parentTitle ) {
		const parsedParentId = parseInt( parentId, 10 ) || null;

		return [
			{
				name: 'template_after_save',
				text: __( 'View', 'elementor' ),
				callback: () => this.navigateToSavedSource( lastSource, parsedParentId, parentTitle ),
			},
		];
	},

	navigateToSavedSource( lastSource, parentId, parentTitle ) {
		elementor.templates.setSourceSelection( lastSource );
		elementor.templates.setFilter( 'source', lastSource, true );

		if ( parentId ) {
			const model = new TemplateLibraryTemplateModel( { template_id: parentId, title: parentTitle } );

			$e.route( 'library/view-folder', { model } );

			elementor.templates.layout.showTemplatesView( new TemplateLibraryCollection( elementor.templates.filterTemplates() ) );

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

		elementor.templates.eventManager.sendPageViewEvent( {
			location: elementor.editorEvents.config.secondaryLocations.templateLibrary.saveModalSelectFolder,
		} );
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
		this.$( '.source-selections-input #cloud' ).prop( 'checked', true );
		this.maybeEnableSaveButton();
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

	handleSourceSelectionChange( event ) {
		this.maybeAllowOnlyOneCheckboxToBeChecked( event );

		this.maybeEnableSaveButton();
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
		if ( this.infoTipDialog ) {
			this.infoTipDialog.hide();
		}

		const message = elementor.templates.hasCloudLibraryQuota()
			? __( 'Upgrade your subscription to get more space and reuse saved assets across all your sites.', 'elementor' )
			: __( 'Upgrade your subscription to access Cloud Templates and reuse saved assets across all your sites.', 'elementor' );

		const goLink = elementor.templates.hasCloudLibraryQuota()
			? 'https://go.elementor.com/go-pro-cloud-templates-save-to-100-usage-notice'
			: 'https://go.elementor.com/go-pro-cloud-templates-save-to-free-tooltip/';

		this.infoTipDialog = elementor.dialogsManager.createWidget( 'buttons', {
			id: 'elementor-library--infotip__dialog',
			effects: {
				show: 'show',
				hide: 'hide',
			},
			position: {
				of: this.ui.infoIcon,
				at: 'top-75',
			},
		} )
			.setMessage( message )
			.addButton( {
				name: 'learn_more',
				text: __(
					'Upgrade Now',
					'elementor',
				),
				classes: '',
				callback: () => {
					open( goLink, '_blank' );
					this.onUpgradeBadgeClicked();
				},
			} );

		this.infoTipDialog.getElements( 'header' ).remove();
		this.infoTipDialog.show();
	},

	showConnectInfoTip() {
		if ( this.connectInfoTipDialog ) {
			this.connectInfoTipDialog.hide();
		}

		this.connectInfoTipDialog = elementor.dialogsManager.createWidget( 'buttons', {
			id: 'elementor-library--connect_infotip__dialog',
			effects: {
				show: 'show',
				hide: 'hide',
			},
			position: {
				of: this.ui.connectBadge,
				at: 'top+80',
			},
		} )
			.setMessage(
				__(
					'To access the Cloud Templates Library you must have an active Elementor Pro subscription',
					'elementor',
				) +
				' <i>' +
				__(
					'and',
					'elementor',
				) +
				'</i> ' +
				__(
					'connect your site.',
					'elementor',
				),
			);

		this.connectInfoTipDialog.getElements( 'header' ).remove();
		this.connectInfoTipDialog.getElements( 'buttonsWrapper' ).remove();
		this.connectInfoTipDialog.show();
	},

	handleElementorConnect() {
		elementor.templates.eventManager.sendPageViewEvent( {
			location: elementor.editorEvents.config.secondaryLocations.templateLibrary.saveModalSelectConnect,
		} );

		this.ui.connect.elementorConnect( {
			success: () => {
				elementor.config.library_connect.is_connected = true;

				$e.run( 'library/close' );
				elementor.notifications.showToast( {
					message: __( 'Connected successfully.', 'elementor' ),
				} );
			},
			error: () => {
				elementor.config.library_connect.is_connected = false;
			},
		} );
	},

	onTemplateNameInputChange() {
		this.maybeEnableSaveButton();
	},

	updateSubmitButtonState( shouldDisableSubmitButton ) {
		this.ui.submitButton.toggleClass( 'e-primary', ! shouldDisableSubmitButton );
		this.ui.submitButton.prop( 'disabled', shouldDisableSubmitButton );
	},

	onUpgradeBadgeClicked() {
		const upgradePosition = elementor.templates.hasCloudLibraryQuota() ? 'save to-max' : 'save to-free';

		elementor.templates.eventManager.sendUpgradeClickedEvent( {
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.saveModal,
			upgrade_position: upgradePosition,
		} );
	},
} );

module.exports = TemplateLibrarySaveTemplateView;
