const TemplateLibraryTemplateModel = require( 'elementor-templates/models/template' );
const TemplateLibraryCollection = require( 'elementor-templates/collections/templates' );
const FolderCollectionView = require( './folders/folders-list' );

const LOAD_MORE_ID = 0;

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
	},

	events: {
		'submit @ui.form': 'onFormSubmit',
		'click @ui.ellipsisIcon': 'onEllipsisIconClick',
		'click @ui.foldersList': 'onFoldersListClick',
		'click @ui.removeFolderSelection': 'onRemoveFolderSelectionClick',
		'click @ui.selectedFolderText': 'onSelectedFolderTextClick',
	},

	onRender() {
		if ( 'save' === this.getOption( 'context' ) ) {
			this.$( '.source-selections-input #cloud' ).prop( 'checked', true );
		}

		if ( 'move' === this.getOption( 'context' ) ) {
			this.handleMoveContextUiState();
		}
	},

	handleMoveContextUiState() {
		this.ui.templateNameInput.val( this.model.get( 'title' ) );

		const fromSource = this.model.get( 'source' );

		if ( 'local' === fromSource ) {
			this.$( '.source-selections-input #cloud' ).prop( 'checked', true );
			this.ui.localInput.addClass( 'disabled' );
		}

		if ( 'cloud' === fromSource ) {
			this.handleCloudSourceInputState( fromSource );
		}
	},

	handleCloudSourceInputState( fromSource ) {
		if ( Number.isInteger( this.model.get( 'parentId' ) ) ) {
			this.getAndSetSelectedFolder( fromSource );

			return;
		}

		this.$( '.source-selections-input #local' ).prop( 'checked', true );
	},

	getAndSetSelectedFolder( fromSource ) {
		elementor.templates.layout.showLoadingView();

		elementor.templates.requestTemplateContent( fromSource, this.model.get( 'parentId' ), {
			success: ( data ) => {
				elementor.templates.layout.hideLoadingView();
				this.handleFolderSelected( data?.id, data?.title );
				this.$( '.source-selections-input #cloud' ).prop( 'checked', true );
			},
			error: ( data ) => {
				elementor.templates.showErrorDialog( data );
			},
			complete: () => {
				elementor.templates.layout.hideLoadingView();
			},
		} );
	},

	getSaveType() {
		let type;

		if ( 'move' === this.getOption( 'context' ) ) {
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
			saveType = this.getSaveType(),
			JSONParams = { remove: [ 'default' ] };

		formData.content = this.model ? [ this.model.toJSON( JSONParams ) ] : elementor.elements.toJSON( JSONParams );

		this.ui.submitButton.addClass( 'elementor-button-state' );

		this.updateSourceSelections( formData );

		this.updateSaveContext( formData );

		elementor.templates.saveTemplate( saveType, formData );
	},

	updateSourceSelections( formData ) {
		const selectedSources = [ 'cloud', 'local' ].filter( ( type ) => formData[ type ] );

		if ( ! selectedSources.length ) {
			return;
		}

		formData.source = selectedSources;

		[ 'cloud', 'local' ].forEach( ( type ) => delete formData[ type ] );
	},

	updateSaveContext( formData ) {
		const saveContext = this.getOption( 'context' ) ?? 'save';

		formData.save_context = saveContext;

		if ( 'move' === saveContext ) {
			formData.from_source = elementor.templates.getFilter( 'source' );
			formData.from_template_id = this.model.get( 'template_id' );

			this.updateSourceState( formData );
		}
	},

	updateSourceState( formData ) {
		if ( ! formData.source.length ) {
			return;
		}

		const lastSource = formData.source.at( -1 );
		elementor.templates.setSourceSelection( lastSource );
		elementor.templates.setFilter( 'source', lastSource, true );
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

					this.highlightSelectedFolder( this.ui.hiddenInputSelectedFolder.val() );

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

	onFoldersListClick( event ) {
		const { id, value } = event.target.dataset;

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
} );

module.exports = TemplateLibrarySaveTemplateView;
