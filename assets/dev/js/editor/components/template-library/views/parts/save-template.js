var TemplateLibrarySaveTemplateView;

import Select2 from 'elementor-editor-utils/select2.js';

TemplateLibrarySaveTemplateView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-save-template',

	template: '#tmpl-elementor-template-library-save-template',

	ui: {
		form: '#elementor-template-library-save-template-form',
		submitButton: '#elementor-template-library-save-template-submit',
		selectDropdown: '#elementor-template-library-save-template-source',

		ellipsisIcon: '.cloud-library-form-inputs .eicon-ellipsis-h',
		foldersList: '.cloud-folder-selection-dropdown ul',
		removeFolderSelection: '.source-selections .selected-folder i',
	},

	events: {
		'submit @ui.form': 'onFormSubmit',

		'click @ui.ellipsisIcon': 'onEllipsisIconClick',
		'click @ui.foldersList': 'onFoldersListClick',
		'click @ui.removeFolderSelection': 'onRemoveFolderSelectionClick',
	},

	getSaveType() {
		let type;
		if ( this.model ) {
			type = this.model.get( 'elType' );
		} else if ( elementor.config.document.library && elementor.config.document.library.save_as_same_type ) {
			type = elementor.config.document.type;
		} else {
			type = 'page';
		}

		return type;
	},

	templateHelpers() {
		var saveType = this.getSaveType(),
			templateType = elementor.templates.getTemplateTypes( saveType );

		return templateType.saveDialog;
	},

	onFormSubmit( event ) {
		event.preventDefault();

		var formData = this.ui.form.elementorSerializeObject(),
			saveType = this.getSaveType(),
			JSONParams = { remove: [ 'default' ] };

		formData.content = this.model ? [ this.model.toJSON( JSONParams ) ] : elementor.elements.toJSON( JSONParams );

		this.ui.submitButton.addClass( 'elementor-button-state' );

		if ( elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ] ) {
			formData.source = []

			if ( formData.cloud ) {
				formData.source.push( 'cloud' );
				delete formData.cloud;
			}

			if ( formData.local ) {
				formData.source.push( 'local' );
				delete formData.local;
			}
		}

		elementor.templates.saveTemplate( saveType, formData );
	},

	onRender() {
		if ( elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ] ) {
			this.activateSelect2();
		}
	},

	activateSelect2() {
		if ( ! this.select2Instance && this.$( this.ui.selectDropdown ).length ) {
			const $dropdown = this.$( this.ui.selectDropdown ),
				select2Options = {
					placeholder: __( 'Where do you want to save your template?', 'elementor' ),
					dropdownParent: this.$el,
					closeOnSelect: false,
					templateResult: this.templateResult.bind( this ),
					templateSelection: this.formatSelected.bind( this ),
				};

			this.select2Instance = new Select2( {
				$element: $dropdown,
				options: select2Options,
			} );

			this.handlePlaceHolder( $dropdown );
		}
	},

	// https://github.com/select2/select2/issues/3292
	handlePlaceHolder( $dropdown ) {
		const $searchField = $dropdown.siblings( '.select2' ).find( '.select2-search__field' );

		if ( $searchField.length && 0 === $searchField.width() ) {
			$searchField.css( 'width', '100%' );
		}
	},

	templateResult( option ) {
		const className = ! option.id || 'local' === option.id || 'cloud' === option.id
			? 'main-item'
			: 'sub-item';

		return jQuery( `<span class="${ className }">${ option.text }</span>` );
	},

	formatSelected( option ) {
		return option.text;
	},

	onEllipsisIconClick() {
		const self = this;
		const $dropdown = this.$( '.cloud-folder-selection-dropdown' );

		if ( $dropdown.is(':visible') ) {
			$dropdown.hide();
			return;
		}

		$dropdown.show();
		this.$( '.cloud-folder-selection-dropdown .eicon-loading' ).show();

		const ul = document.querySelector( '.cloud-folder-selection-dropdown ul' );
		ul.innerHTML = '';

		elementorCommon.ajax.addRequest( 'get_folders', {
			data: {
				source: 'cloud',
			},
			success( response ) {
				self.$( '.cloud-folder-selection-dropdown .eicon-loading' ).hide();
				self.$( '.cloud-folder-selection-dropdown' ).show();

				Object.entries( response ).forEach( ( [ key, value ] ) => {
					const li = document.createElement( 'li' );

					li.textContent = value;
					li.setAttribute( 'data-id', key );
					li.setAttribute( 'data-value', value );
					ul.appendChild( li );
				});
			},
		} );
	},

	onFoldersListClick( event ) {
		const { id, value } = event.target.dataset;

		this.$( '.cloud-folder-selection-dropdown' ).hide();
		this.$( '.cloud-library-form-inputs .eicon-ellipsis-h' ).hide();

		const selectedFolder = document.querySelector( '.selected-folder' );
		if ( selectedFolder ) {
			selectedFolder.insertBefore( document.createTextNode( value ), selectedFolder.querySelector( 'i' ) );
		}

		this.$( '.selected-folder' ).show();
		this.$( '#parentId' ).val( id );
	},

	onRemoveFolderSelectionClick() {
		const selectedFolder = document.querySelector( '.selected-folder' );
		if ( selectedFolder ) {
			const firstChild = selectedFolder.firstChild;

			if ( firstChild.nodeType === Node.TEXT_NODE ) {
				selectedFolder.removeChild( firstChild );
			}
		}

		this.$( '.selected-folder' ).hide();
		this.ui.ellipsisIcon.show();
		this.$( '#parentId' ).val( '' );
	},
} );

module.exports = TemplateLibrarySaveTemplateView;
